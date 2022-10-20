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
    if (types.includes(type)) {
      this.type = type;
    } else {
      throw new Error(`Trying to create character with type (${type}) not matched the legal type list!`);
    }

    this.health = 100;
    this.level = 1;
  }
}
