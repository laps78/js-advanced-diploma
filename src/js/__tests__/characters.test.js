import Character from '../characters/Character';

test('при создании вызове конструктора new Character должна выбрасываться ошибка', () => {
  expect(() => new Character('zombie')).toThrow(new Error('Parent constructor <Character> can not be envoked directly!'));
});
