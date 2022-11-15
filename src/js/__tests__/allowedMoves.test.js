import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

const controller = new GameController(new GamePlay(), new GameStateService());
const testChar = {
  type: 'bowman',
  health: 100,
  level: 3,
  attack: 25,
  defence: 25,
  moveRange: 2,
  attackRange: 2,
  side: 'friendly',
};
testChar.position = 27;
controller.allCharactersOnMap = [testChar];

const allowedEtalon = [
  26,
  25,
  28,
  29,
  18,
  19,
  20,
  9,
  11,
  13,
  34,
  35,
  36,
  41,
  43,
  45,
];

test('allowedMoves should be defined properly', () => {
  expect(controller.defineAllowedMoves(testChar.position)).toEqual(allowedEtalon);
});
