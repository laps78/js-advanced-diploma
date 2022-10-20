import Character from '../characters/Character';

test.each([
  'swordsman',
  'bowman',
  'magician',
  'daemon',
  'undead',
  'vampire',
])('должен создаваться пустой базовый персонаж', (type) => {
  const newCharacter = new Character(type);
  expect(newCharacter.type).toBe(type);
});

test('при создании персонажа неверного типа должна выбрасываться ошибка', () => {
  expect(() => new Character('zombie')).toThrow(new Error('Trying to create character with type (zombie) not matched the legal type list!'));
});
