import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    yield (() => {
      const randomClassIndex = Math.floor(Math.random() * allowedTypes.length);
      const randomLevel = Math.floor(Math.random() * (maxLevel)) + 1;
      const newCharacter = new allowedTypes[randomClassIndex](randomLevel);
      return newCharacter;
    })();
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = new Team();
  for (let i = 0; i <= characterCount; i += 1) {
    const generatorWork = characterGenerator(allowedTypes, maxLevel);
    team.addCharacter(generatorWork.next().value);
  }
  return team;
}
