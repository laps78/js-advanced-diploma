import Vampire from '../characters/Vampire';

test('должен создаваться правильный вампир', () => {
  const etalonVampire = {
    type: 'vampire',
    health: 100,
    level: 2,
    attack: 25,
    defence: 25,
    moveRange: 2,
    attackRange: 2,
  };
  expect(new Vampire(2)).toEqual(etalonVampire);
});
