import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import { characterGenerator, generateTeam } from '../generators';
import Character from '../characters/Character';

const aviableCharacterClasses = [
  Swordsman,
  Bowman,
  Magician,
  Daemon,
  Undead,
  Vampire,
];

const newCharacterGenerator = characterGenerator(aviableCharacterClasses, 4);
// forming test array suites
const testArray = [];
for (let i = 0; i <= 15; i += 1) {
  testArray.push(newCharacterGenerator.next().value);
}

test.each([
  testArray,
])('выдаёт ли генератор characterGenerator бесконечно новые персонажи из списка (учёт аргумента allowedTypes)', (call) => {
  expect(call).toBeInstanceOf(Character);
});

test.each([
  [generateTeam(aviableCharacterClasses, 4, 1), 4],
])('тест учета аргумента maxLevel', (call, maxLevel) => {
  expect(call.characters[0].level).toBeLessThan(maxLevel);
});
