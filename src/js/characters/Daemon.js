import Character from './Character';

export default class Daemon extends Character {
  constructor(level) {
    super('daemon');
    this.level = level;
    this.attack = 10;
    this.defence = 10;
  }
}
