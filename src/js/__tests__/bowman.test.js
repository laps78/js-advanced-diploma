import Bowman from '../characters/Bowman';

test('должен создаваться правильный лучник', () => {
  const etalonBowman = {
    type: 'bowman',
    health: 100,
    level: 3,
    attack: 25,
    defence: 25,
    moveRange: 2,
    attackRange: 2,
  };
  expect(new Bowman(3)).toEqual(etalonBowman);
});
