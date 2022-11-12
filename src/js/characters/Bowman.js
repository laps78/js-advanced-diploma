import Character from './Character';

export default class Bowman extends Character {
  constructor(level) {
    super('bowman');
    this.level = level;
    this.attack = 25;
    this.defence = 25;
    this.moveRange = 2;
    this.attackRange = 2;
    this.side = 'friendly';
  }
}
