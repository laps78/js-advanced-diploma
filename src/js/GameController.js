import themes from './themes';
import { generateTeam } from './generators';
import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    // L.A.P.S. codes
    this.globalOptions = {
      maxLevel: 4, // maximum character's level
      teamCount: 3, // team size
      playerTeamAllowedTypes: [Swordsman, Bowman, Magician], // allowed characters for player's team
      cpuTeamAllowedTypes: [Daemon, Undead, Vampire], // allowed characters for CPU's team
      playerAllowedPositions: [
        0,
        1,
        8,
        9,
        16,
        17,
        24,
        25,
        32,
        33,
        40,
        41,
        48,
        49,
        56,
        57, // possible start positions for player's team
      ],
      cpuAllowedPositions: [
        6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63, // possible start positions for CPU's team
      ],
    };
    this.charactersPositions = [];
    this.players = ['player', 'cpu'];
    this.turn = this.players[0];
    this.selectedCell = null;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);

    // generates random position from array of allowed
    function* positionRandomizer(allowedPositions) {
      while (true) {
        const allowedPositionIndex = Math.floor(Math.random() * allowedPositions.length);
        const newPosition = allowedPositions[allowedPositionIndex];
        allowedPositions.splice(allowedPositionIndex, 1);
        yield newPosition;
      }
    }

    // Init & dispose player team
    this.playerTeam = generateTeam(this.globalOptions.playerTeamAllowedTypes, this.globalOptions.maxLevel, this.globalOptions.teamCount);
    this.playerTeam.characters.forEach((character, characterIndex) => {
      const generatePlayerPosition = positionRandomizer(this.globalOptions.playerAllowedPositions);
      const positionedCharacter = new PositionedCharacter(character, generatePlayerPosition.next().value);
      this.playerTeam.characters[characterIndex] = positionedCharacter;
    });

    // Init & dispose CPU team
    this.cpuTeam = generateTeam(this.globalOptions.cpuTeamAllowedTypes, this.globalOptions.maxLevel, this.globalOptions.teamCount);
    this.cpuTeam.characters.forEach((character, characterIndex) => {
      const generateCPUPosition = positionRandomizer(this.globalOptions.cpuAllowedPositions);
      const positionedCharacter = new PositionedCharacter(character, generateCPUPosition.next().value);
      this.cpuTeam.characters[characterIndex] = positionedCharacter;
    });

    /* render */
    // Создаем массив всех персонажей на поле
    this.allCharactersOnMap = [...this.cpuTeam.characters, ...this.playerTeam.characters];
    // вносим координаты всех персонажей в массив координат
    this.charactersPositions = this.allCharactersOnMap.map((character) => character.position);
    // отрисовываем персонажей на поле
    this.gamePlay.redrawPositions(this.allCharactersOnMap);

    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click
    if (this.charactersPositions.includes(index)) {
      const characterInCell = this.detectCharacterInCell(index).character;
      if (characterInCell instanceof Swordsman || characterInCell instanceof Bowman || characterInCell instanceof Magician) {
        if (!isNaN(parseInt(this.selectedCell, 10))) {
          this.gamePlay.deselectCell(this.selectedCell);
        }
        this.selectedCell = index;
        this.gamePlay.selectCell(this.selectedCell);
        // cell is selected. NEXT LOGICS
        // ... look up in oncellEnter
      } else {
        GamePlay.showError('It\'s an enemy, dude!');
      }
    } else {
      GamePlay.showError('Nobody here, dude!');
    }
  }

  isPlayers(characterInCell) {
    if (characterInCell instanceof Swordsman || characterInCell instanceof Bowman || characterInCell instanceof Magician) {
      return true;
    }
    return false;
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.charactersPositions.includes(index)) {
      this.gamePlay.showCellTooltip(this.showCharacterInCellInfo(index), index);
      // TODO change cursor if character in cell is player's
      const characterInCell = this.detectCharacterInCell(index).character;
      if (this.isPlayers(characterInCell)) {
        this.gamePlay.setCursor('pointer');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
      // TODO make cursor mark allowwed cells
      if (this.selectedCell
        && this.isPlayers(this.selectedCell)
        && this.defineAllowedMoves().contains(index)) {
        this.gamePlay.setCursor('crosshair');
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
  }

  /**
   * If there's character in cell returns it
   * @param index index of testing cell
   * @returns character from allCharactersOnMap array
   */
  detectCharacterInCell(index) {
    const characterInCell = this.allCharactersOnMap.find((character) => character.position === index);
    return characterInCell;
  }

  showCharacterInCellInfo(index) {
    const characterInCell = this.detectCharacterInCell(index).character;
    const message = `🎖 ${characterInCell.level} ⚔ ${characterInCell.attack} 🛡 ${characterInCell.defence} ♥ ${characterInCell.health}`;
    return message;
  }

  /**
   * This method defines allowed moves for current selected character
   * @param index index of selected cell
   * @param size is current boardsize
   * @returns array of allowed moves cells indexes
   */
  defineAllowedMoves(index) {
    const size = this.gamePlay.boardSize;
    const characterInCell = this.detectCharacterInCell(index).character;
    const range = characterInCell.moveRange;
    const allowedMoves = [];
    const indexRow = Math.floor(index / size);
    const indexCol = index % size;

    for (let i = 1; i <= range; i += 1) {
      if (indexCol + i < size) {
        allowedMoves.push(indexRow * size + (indexCol + i));
      }
      if (indexCol - i >= 0) {
        allowedMoves.push(indexRow * size + (indexCol - i));
      }
      if (indexRow + i < size) {
        allowedMoves.push((indexRow + i) * size + indexCol);
      }
      if (indexRow - i >= 0) {
        allowedMoves.push((indexRow - i) * size + indexCol);
      }
      if (indexRow + i < size && indexCol + i < size) {
        allowedMoves.push((indexRow + i) * size + (indexCol + i));
      }
      if (indexRow - i >= 0 && indexCol - i >= 0) {
        allowedMoves.push((indexRow - i) * size + (indexCol - i));
      }
      if (indexRow + i < size && indexCol - i >= 0) {
        allowedMoves.push((indexRow + i) * size + (indexCol - i));
      }
      if (indexRow - i >= 0 && indexCol + i < size) {
        allowedMoves.push((indexRow - i) * size + (indexCol + i));
      }
    }
    debugger;
    return allowedMoves.filter((move) => !this.charactersPositions.includes(move));
  }

  /** TODO deleete, replace or modify this function!!!
   * This method defines allowed attacks for selected character
   * @param index index of selected cell
   * @returns array of allowed attacks cells indexes
   */
  defineAllowedAttacks(index) {
    const characterInCell = this.detectCharacterInCell(index).character;
    const allowedAttacks = [];
    for (let step = 1; step <= characterInCell.attackRange; step += 1) {
      // some code
    }
    return allowedAttacks;
  }

  changeTurn() {
    if (this.turn === this.players[0]) {
      this.turn = this.players[1];
    } else {
      this.turn = this.players[0];
    }
    return this.turn;
  }
}
