export default class CharacterData {
  constructor(data) {
    data = data || {};
    this.index = data.index || 0;
    this.name = data.name || "Unnamed";
    this.description = data.description || "";
    this.rarity = data.rarity || 0;
    this.maxHealth = data.maxHealth || 30;
    this.health = data.health || this.maxHealth;
    this.speed = data.speed || 3;
    this.bodyTexture = data.bodyTexture || {
      front: "unit-front-no1",
      back: "unit-back-no1"
    };
    this.coordinate = data.coordinate || {
      x: 0,
      y: 0
    };
  }

  equals(data) {
    if (data.name == this.name && data.rarity == this.rarity) {
      return true;
    } else {
      return false;
    }
  }
}
