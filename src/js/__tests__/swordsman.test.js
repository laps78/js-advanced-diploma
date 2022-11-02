import Swordsman from '../characters/Swordsman';

test('должен создаваться правильный мечник', () => {
  const etalonSwordsman = {
    type: 'swordsman',
    health: 100,
    level: 2,
    attack: 40,
    defence: 10,
    moveRange: 4,
    attackRange: 1,
  };
  expect(new Swordsman(2)).toEqual(etalonSwordsman);
});
