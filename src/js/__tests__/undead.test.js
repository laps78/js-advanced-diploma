import Undead from '../characters/Undead';

test('должен создаваться правильная нежить', () => {
  const etalonUndead = {
    type: 'undead',
    health: 100,
    level: 2,
    attack: 40,
    defence: 10,
    moveRange: 4,
    attackRange: 1,
  };
  expect(new Undead(2)).toEqual(etalonUndead);
});
