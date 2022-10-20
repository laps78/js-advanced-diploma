const types = [
  'swordsman',
  'bowman',
  'magician',
  'daemon',
  'undead',
  'vampire',
];
export default class Character {
  constructor(type) {
    if (new.target.name === 'Character') throw new Error('Parent constructor <Character> can not be envoked directly!');
    if (types.includes(type)) {
      this.type = type;
    } else {
      throw new Error(`Trying to create character with type (${type}) not matched the legal type list!`);
    }

    this.health = 100;
    this.level = 1;
  }
}
