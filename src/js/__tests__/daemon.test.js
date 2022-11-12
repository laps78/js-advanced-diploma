import Daemon from '../characters/Daemon';

test('должен создаваться правильный демон', () => {
  const etalonDaemon = {
    type: 'daemon',
    health: 100,
    level: 2,
    attack: 10,
    defence: 10,
    moveRange: 1,
    attackRange: 4,
    side: 'enemy',
  };
  expect(new Daemon(2)).toEqual(etalonDaemon);
});
