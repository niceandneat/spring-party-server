export default class Character {
  constructor(characterData) {

    /**
     * Character meta info
     */
    this.meta = characterData;

    /**
     * Character position
     */
    this.coordinate = {
      x: this.meta.coordinate.x,
      y: this.meta.coordinate.y
    }; // in tile grid
    this.targetPosition = {
      x: 0,
      y: 0
    }; // in real-world graphics

    // Whether this character is frontier of party
    this._head = false;

    // Current direction
    this._direction = -1;

    // Character health
    this._health = this.meta.health;

  }

  get speed() {
    return this.meta.speed;
  }

  get health() {
    return this._health;
  }

  /**
   * Set health value
   */
  set health(value) {
    value = Math.max(Math.min(value, this.meta.maxHealth), 0);
    if (value != this._health) {
      this._health = value;
    }
  }

  get jump() {
    return this._jumpStarted;
  }

  /**
   * Start or stop jumping
   */
  set jump(value) {
    if (this._jumpStarted == value) {
      return;
    }
    if (value) {
    this._jumpStarted = value;
    }
  }

  get head() {
    return this._head;
  }

  /**
   * Set whether is character is head or not
   */
  set head(value) {
    if (this._head == value) {
      return;
    }
    this._head = value;
  }

  get direction() {
    return this._direction;
  }

  /**
   * Set new direction for this character
   */
  set direction(value) {
    if (this._direction == value || value > 3) {
      return;
    }
    this._direction = value;
  }

}
