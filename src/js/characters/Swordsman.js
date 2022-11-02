import Character from './Character';

export default class Swordsman extends Character {
  constructor(level) {
    super('swordsman');
    this.level = level;
    this.attack = 40;
    this.defence = 10;
    this.moveRange = 4;
    this.attackRange = 1;
  }
}
