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
      playerAllowedPositions: [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57, // possible start positions for player's team
      ],
      cpuAllowedPositions: [
        6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63, // possible start positions for CPU's team
      ],
    };
    this.charactersPositions = [];
    this.players = ['player', 'cpu'];
    this.turn = this.players[0];
    this.selectedCell = {
      index: null,
      allowedMoves: null,
      allowedAttacks: null,
    };
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
    // вносим координаты всех персонажей в массив координат персонажей
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
      if (characterInCell.side === 'friendly') {
        if (this.selectedCell.index !== null) {
          this.deselectCell();
        }
        this.selectedCell.index = index;
        this.gamePlay.selectCell(this.selectedCell.index);
        // cell is selected. NEXT LOGICS
        this.selectedCell.allowedMoves = this.defineAllowedMoves(index); // defines allowed moves
        this.highlightAllowedMoves(this.selectedCell.allowedMoves); // highlights allowed moves
        this.selectedCell.allowedAttacks = this.defineAllowedAttacks(index); // TODO define allowed attacks!
        this.highlightAllowedAttacks(this.selectedCell.allowedAttacks); // highligths allowed attacks
        // ... look up in oncellEnter
      } else {
        GamePlay.showError('It\'s an enemy, dude!');
      }
    } else {
      // folowing logics should make selected character move
      if (this.selectedCell.allowedMoves.includes(index)) {
        this.makeMove(this.selectedCell.index, index);
        this.deselectCell();
      } else if (this.detectCharacterInCell(this.selectedCell.index).character.side === 'enemy'
        && this.selectedCell.allowedAttacks.includes(index)) {
        console.log('do attack!!!');
      } else {
        GamePlay.showError('Nobody here, dude!');
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.charactersPositions.includes(index)) { // если кто-то есть
      this.gamePlay.showCellTooltip(this.showCharacterInCellInfo(index), index); // показать статус
      // TODO change cursor if character in cell is player's
      const characterInCell = this.detectCharacterInCell(index).character;
      if (characterInCell.side === 'friendly') { // if friendly
        this.gamePlay.setCursor('pointer'); // поменять курсор
      } else if (this.selectedCell.index !== null
        && this.selectedCell.allowedAttacks !== null
        && this.selectedCell.allowedAttacks.includes(index)
        && this.detectCharacterInCell(index).character.side === 'enemy') {
        this.gamePlay.setCursor('crosshair');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    } else if (this.selectedCell.index !== null && this.selectedCell.allowedMoves.includes(index)) {
      // TODO make cursor mark allowwed cells
      this.gamePlay.setCursor('pointer');
    } else if (this.selectedCell.index !== null
      && this.detectCharacterInCell(this.selectedCell.index).character.side === 'enemy'
      && this.selectedCell.allowedAttacks.includes(index)) {
      this.gamePlay.setCursor('crosshair');
    } else {
      this.gamePlay.setCursor('not-allowed');
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
   * this method makes deselect cell routine operations
   */
  deselectCell() {
    this.deHighlightAllowedMoves(this.selectedCell.allowedMoves);
    this.deHighlightAllowedAttacks(this.selectedCell.allowedAttacks);
    this.gamePlay.deselectCell(this.selectedCell.index);
    this.selectedCell.index = null;
    this.selectedCell.allowedAttacks = [];
    this.selectedCell.allowedMoves = [];
  }

  /**
   * this method change selected character position value to 'moveTo' & redraws cells
   * @param index is current selectedCell index
   * @param moveTo is index on which to move
   */
  makeMove(index, moveTo) {
    const characterToMove = this.detectCharacterInCell(index);
    characterToMove.position = moveTo;
    this.charactersPositions = this.allCharactersOnMap.map((character) => character.position);
    this.gamePlay.redrawPositions(this.allCharactersOnMap);
  }

  /**
   * this method highlights cells of allowed moves
   * @param array of allowed move indexes
   * @returns nothing
   */
  highlightAllowedMoves(array) {
    array.forEach((move) => {
      this.gamePlay.cells[move].classList.add('allowed-move');
      this.gamePlay.cells[move].title = 'You can move selected unit here!';
    });
  }

  /**
   * this method highlights cells of allowed moves
   * @param array of allowed move indexes
   * @returns nothing
   */
  deHighlightAllowedMoves(array) {
    array.forEach((move) => {
      this.gamePlay.cells[move].classList.remove('allowed-move');
      this.gamePlay.cells[move].title = '';
    });
  }

  /**
   * this method highlights cells of allowed attacks
   * @param array of allowed move indexes
   * @returns nothing
   */
  highlightAllowedAttacks(array) {
    array.forEach((attack) => {
      this.gamePlay.cells[attack].classList.add('allowed-attack');
      this.gamePlay.cells[attack].title = 'Thi cell is in attack range of selected unit!';
    });
  }

  /**
   * this method dehighlights cells of allowed attack
   * @param array of allowed move indexes
   * @returns nothing
   */
  deHighlightAllowedAttacks(array) {
    array.forEach((attack) => {
      this.gamePlay.cells[attack].classList.remove('allowed-attack');
      this.gamePlay.cells[attack].title = '';
    });
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

    for (let step = 1; step <= range; step += 1) {
      if (indexCol + step < size) {
        allowedMoves.push(indexRow * size + (indexCol + step));
      }
      if (indexCol - step >= 0) {
        allowedMoves.push(indexRow * size + (indexCol - step));
      }
      if (indexRow + step < size) {
        allowedMoves.push((indexRow + step) * size + indexCol);
      }
      if (indexRow - step >= 0) {
        allowedMoves.push((indexRow - step) * size + indexCol);
      }
      if (indexRow + step < size && indexCol + step < size) {
        allowedMoves.push((indexRow + step) * size + (indexCol + step));
      }
      if (indexRow - step >= 0 && indexCol - step >= 0) {
        allowedMoves.push((indexRow - step) * size + (indexCol - step));
      }
      if (indexRow + step < size && indexCol - step >= 0) {
        allowedMoves.push((indexRow + step) * size + (indexCol - step));
      }
      if (indexRow - step >= 0 && indexCol + step < size) {
        allowedMoves.push((indexRow - step) * size + (indexCol + step));
      }
    }
    return allowedMoves.filter((move) => !this.charactersPositions.includes(move));
  }

  /** TODO modify this function!!!
   * This method defines allowed attacks for selected character
   * @param index index of selected cell
   * @returns array of allowed attacks cells indexes
   */
  defineAllowedAttacks(index) {
    const size = this.gamePlay.boardSize;
    const characterInCell = this.detectCharacterInCell(index).character;
    const range = characterInCell.attackRange;
    const allowedAttacks = [];
    const indexRow = Math.floor(index / size);
    const indexCol = index % size;

    for (let step = 1; step <= range; step += 1) {
      if (indexCol + step < size) { // going right
        const result = indexRow * size + (indexCol + step);
        allowedAttacks.push(result);
        if (step > 1) {
          for (let i = 1; i < step; i += 1) {
            if (result - (size * i) >= 0) { // fill up
              allowedAttacks.push(result - size * i);
            }
            if (result + (size * i) <= (size * size) - 1) { // fill down
              allowedAttacks.push(result + (size * i));
            }
          }
        }
      }
      if (indexCol - step >= 0) { // going left
        const result = indexRow * size + (indexCol - step);
        allowedAttacks.push(result);
        if (step > 1) {
          for (let i = 1; i < step; i += 1) {
            if (result - (size * i) >= 0) { // fill up
              allowedAttacks.push(result - (size * i));
            }
          }
          for (let i = 1; i < step; i += 1) {
            if (result + (size * i) >= 0) { // fill down
              allowedAttacks.push(result + (size * i));
            }
          }
        }
      }
      if (indexRow + step < size) {
        allowedAttacks.push((indexRow + step) * size + indexCol);
      }
      if (indexRow - step >= 0) {
        allowedAttacks.push((indexRow - step) * size + indexCol);
      }
      if (indexRow + step < size && indexCol + step < size) { // если внизу справа есть место
        const result = (indexRow + step) * size + (indexCol + step);
        allowedAttacks.push(result); // идем вправо-вниз
        if (step > 1) {
          for (let i = 1; i < step; i += 1) {
            allowedAttacks.push(result - i);
          }
        }
      }
      if (indexRow - step >= 0 && indexCol - step >= 0) { // если вверху слева есть место
        allowedAttacks.push((indexRow - step) * size + (indexCol - step)); // идем влево-вверх
      }
      if (indexRow + step < size && indexCol - step >= 0) { // если внизу слева есть место
        const result = (indexRow + step) * size + (indexCol - step);
        allowedAttacks.push(result); // идем влево-вниз
      }
      if (indexRow - step >= 0 && indexCol + step < size) { // если вверху справа есть место
        const result = (indexRow - step) * size + (indexCol + step);
        allowedAttacks.push(result); // идем вправо-вверх
        if (step > 1) {
          for (let i = 1; i < step; i += 1) {
            allowedAttacks.push(result - i);
          }
        }
      }
    }
    // debugger;
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
