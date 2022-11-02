import Magician from '../characters/Magician';

test('должен создаваться правильный маг', () => {
  const etalonMagician = {
    type: 'magician',
    health: 100,
    level: 2,
    attack: 10,
    defence: 40,
    moveRange: 1,
    attackRange: 4,
  };
  expect(new Magician(2)).toEqual(etalonMagician);
});
