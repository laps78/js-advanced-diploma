import themes from './themes';
import { generateTeam } from './generators';
import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';

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
        0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57, // possible start positions for player's team
      ],
      cpuAllowedPositions: [
        6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63, // possible start positions for CPU's team
      ],
    };
    this.init();
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
    /* disposal */
    this.playerTeam.characters.forEach((character, characterIndex) => {
      const generatePlayerPosition = positionRandomizer(this.globalOptions.playerAllowedPositions);
      const newRandomPosition = generatePlayerPosition.next().value;
      const positionedCharacter = new PositionedCharacter(character, newRandomPosition);
      this.playerTeam.characters[characterIndex] = positionedCharacter;
    });

    // Init & dispose CPU team
    this.cpuTeam = generateTeam(this.globalOptions.cpuTeamAllowedTypes, this.globalOptions.maxLevel, this.globalOptions.teamCount);
    // disposal
    this.cpuTeam.characters.forEach((character, characterIndex) => {
      const generateCPUPosition = positionRandomizer(this.globalOptions.cpuAllowedPositions);
      const positionedCharacter = new PositionedCharacter(character, generateCPUPosition.next().value);
      this.cpuTeam.characters[characterIndex] = positionedCharacter;
    });

    /* render */
    this.gamePlay.redrawPositions([...this.cpuTeam.characters, ...this.playerTeam.characters]);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
