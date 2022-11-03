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
    this.init();
    this.players = ['player', 'cpu'];
    this.turn = this.players[0];
    this.selectedCell = null;
    this.fieldBorders = this.defineFieldBorders();
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
        if (this.selectedCell) this.gamePlay.deselectCell(this.selectedCell);
        this.selectedCell = index;
        this.gamePlay.selectCell(this.selectedCell);
      } else {
        GamePlay.showError('It\'s an enemy, dude!');
      }
    } else {
      GamePlay.showError('Nobody here, dude!');
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.charactersPositions.includes(index)) {
      this.gamePlay.showCellTooltip(this.showCharacterInCellInfo(index), index);
      // TODO change cursor if character in cell is player's
      const characterInCell = this.detectCharacterInCell(index);
      if (characterInCell.character instanceof Swordsman || characterInCell.character instanceof Bowman || characterInCell.character instanceof Magician) {
        this.gamePlay.setCursor('pointer');
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
   * @param {*} index index of testing cell
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
   * @returns array of border's cells indexes
   */
  defineFieldBorders() {
    const borderIndexes = {
      topLeft: null,
      top: [],
      topRight: null,
      right: [],
      bottomRight: [],
      bottom: [],
      bottomLeft: null,
      left: [],
      allBorders: [],
    };

    this.gamePlay.cells.forEach((cell, index) => {
      if (cell.classList.contains('map-tile-top-left')) borderIndexes.topLeft = index;
      if (cell.classList.contains('map-tile-top-right')) borderIndexes.topRight = index;
      if (cell.classList.contains('map-tile-bottom-left')) borderIndexes.bottomLeft = index;
      if (cell.classList.contains('map-tile-bottom-right')) borderIndexes.bottomRight = index;
      if (cell.classList.contains('map-tile-top')) borderIndexes.top.push(index);
      if (cell.classList.contains('map-tile-bottom')) borderIndexes.bottom.push(index);
      if (cell.classList.contains('map-tile-left')) borderIndexes.left.push(index);
      if (cell.classList.contains('map-tile-right')) borderIndexes.right.push(index);

      if (cell.classList.contains('map-tile-top-left')
        || cell.classList.contains('map-tile-top-right')
        || cell.classList.contains('map-tile-bottom-left')
        || cell.classList.contains('map-tile-bottom-right')
        || cell.classList.contains('map-tile-top')
        || cell.classList.contains('map-tile-bottom')
        || cell.classList.contains('map-tile-left')
        || cell.classList.contains('map-tile-right')) {
        borderIndexes.allBorders.push(index);
      }
    });
    return borderIndexes;
  }

  /**
   * This method defines allowed moves for selected character
   * @param index index of selected cell
   * @returns array of allowed moves cells indexes
   */
  defineAllowedMoves(index) {
    const characterInCell = this.detectCharacterInCell(index).character;
    const allowedMoves = [];
    for (let step = 1; step <= characterInCell.moveRange; step += 1) {
      for (let i = 0; i < 8; i += 1) {
        // go up
        // go up-right
        // go right
        // go right-down
        // go down
        // go left-down
        // go left
        // go left-up
        // exclude occupied cells
        // exclude steps out of borders
      }
    }
    return allowedMoves;
  }

  /**
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
