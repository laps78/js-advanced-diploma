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
for (let i = 0; i <= 10; i += 1) {
  testArray.push(newCharacterGenerator);
}

test.each([
  testArray,
])('выдаёт ли генератор characterGenerator бесконечно новые персонажи из списка (учёт аргумента allowedTypes)', (call) => {
  expect(call).toBeInstanceOf(Object in aviableCharacterClasses);
});
