import nickGenerator from "nick-generator";

import Connection from "../Connection"
import Character from "./Character.js";
import Configuration from "./Configuration.js";

export default class Party {
  constructor(userId, id, territoryColor) {
    /**
     * Party identifier
     */
    this.id = id;
    this.userId = userId ? userId : nickGenerator();
    this.territoryColor = territoryColor;
    this.isAi = false;
    this.roomId = null;

    // Start coordinate
    this._startCoordinate = null;
    this._startDirection = null;

    /**
     * Members of party
     */
    this.deckCode = null;
    this.head = null;
    this.members = [];
    this._eliminatedMembers = [];
    this._scheduledCoordinate = {};


    // Party speed
    this._speed = 0;
    this._speedOutdated = true;

    // Party direction
    this._reached = false;
    this._displaced = false;
    this._scheduledDirection = -1;

    // Party halt
    this._halted = false;
    this._haltTimeLeft = 0;
    this._haltCallback = null;

    // Path history
    this._lastStep = null;

    // Event listeners
    this._onEliminateHandler = [];
    this._onDamageHandler = [];
    this._onDisplacedHandler = [];

    // Stop jump when damaged
    this.onDamage(() => {
      for (let i in this.members) {
        this.members[i].jump = false;
      }
    });
  }

  update(deltaTime) {
    if (this._displaced) {
      if (this._halted) {
        this._haltTimeLeft -= deltaTime;
        if (this._haltTimeLeft <= 0) {
          this._halted = false;
          this._haltCallback();
        }
      }

      if (!this._halted) {
        if (this._isArrived(deltaTime)) {
          this._finishStep();
        } else {
          this._proceedStep(deltaTime);
        }
      }
    }
  }

  onEliminate(handler) {
    this._onEliminateHandler.push(handler);
  }

  onDisplaced(handler) {
    this._onDisplacedHandler.push(handler);
  }

  onDamage(handler) {
    this._onDamageHandler.push(handler);
  }

  get reached() {
    return this._reached && !this._halted;
  }

  get halted() {
    return this._halted;
  }

  get startCoordinate() {
    return (
      this._startCoordinate || {
        x: 0,
        y: 0
      }
    );
  }

  /**
   * Get direction of this party
   */
  get direction() {
    return this.head.direction;
  }

  /**
   * Get speed of this party
   */
  get speed() {
    if (this.members.length < 1) {
      return 0;
    }
    if (this._speedOutdated) {
      let minimumSpeed = this.members[0].meta.speed;
      for (let i = 1; i < this.members.length; i++) {
        if (this.members[i].meta.speed < minimumSpeed) {
          minimumSpeed = this.members[i].meta.speed;
        }
      }
      this._speed = minimumSpeed;
      this._speedOutdated = false;
    }
    return this._speed;
  }

  get scheduledDirection() {
    return this._scheduledDirection;
  }

  get nextDirection() {
    return this._scheduledDirection >= 0
      ? this._scheduledDirection
      : this.direction;
  }

  setStartCoordinate(x, y, direction) {
    this._startCoordinate = {
      x: x,
      y: y
    };
    this._startDirection = direction;
  }

  /**
   * Add new member to party
   *
   * @param {Character} member
   */
  addMember(member) {
    if (this.members.length < 1) {
      this.head = member;
      this.head.head = true;
    }
    member.arrowGuideColor = this.territoryColor;
    this.members.push(member);
    this._speedOutdated = true;
  }

  /**
   * Eliminate member from party
   *
   * @param {Character} member
   */
  eliminateMember(member) {
    let i = this.members.indexOf(member);

    if (i >= 0) {
      // Remove from list
      this.members.splice(i, 1);
      this._eliminatedMembers.push(member);

      // Disable graphics
      member.jump = false;

      // If none of members left,
      if (this.members.length > 0) {
        // If removed member was head, replace head
        if (i == 0) {
          member.head = false;
          this.members[0].head = true;
          this.members[0].coordinate = member.coordinate;
          this.members[0].direction = member.direction;
          this.head = this.members[0];
        }
      }
      // Dispatch event
      for (let j = 0; j < this._onEliminateHandler.length; j++) {
        this._onEliminateHandler[j](member, this.members.length < 1);
      }
      this._speedOutdated = true;
      return true;
    }
    return false;
  }

  /**
   * Damage this party!
   *
   * @param {Integer} amount
   */
  damage(amount) {
    if (this.members.length > 0) {
      this.members[0].health -= amount;

      // Dispatch event
      for (let j = 0; j < this._onDamageHandler.length; j++) {
        this._onDamageHandler[j](this.members[0], amount);
      }

      // Eliminated!
      if (this.members[0].health <= 0) {
        this.eliminateMember(this.members[0]);
        return true;
      }
    }
    return false;
  }

  /**
   * Heal this party!
   *
   * @param {Integer} amount
   */
  heal(amount) {
    if (this.members.length > 0) {
      for (let i = 0; i < this.members.length; i++) {
        if (this.members[i].health < this.members[i].meta.maxHealth) {
          this.members[i].health += amount;
          break;
        }
      }
    }
  }

  displaceToStartCoordinate() {
    this.displace(this._startCoordinate, this._startDirection);
  }

  displace(coordinate, direction) {
    // Initialize
    this._displaced = true;
    this._justDisplaced = true;
    this._scheduledDirection = -1;

    let position = this._translateCoordinate(coordinate);
    this.head.direction = direction;
    this.head.coordinate.x = coordinate.x;
    this.head.coordinate.y = coordinate.y;
    this.head.targetPosition.x = position.x;
    this.head.targetPosition.y = position.y;
    this.head.x = position.x;
    this.head.y = position.y;
    this._scheduledCoordinate.x = coordinate.x;
    this._scheduledCoordinate.y = coordinate.y;

    this.head.jump = true;

    for (let i = 1; i < this.members.length; i++) {
      this.members[i].jump = false;
    }
    this._lastStep = null;

    for (let i = 0; i < this._onDisplacedHandler.length; i++) {
      this._onDisplacedHandler[i](coordinate);
    }
  }

  halt(seconds, callback) {
    this._halted = true;
    this._haltTimeLeft = seconds * 60;
    this._haltCallback = callback;
  }

  scheduleDirection(direction, coordinate) {
    if (!this._halted) {
      this._scheduledDirection = direction;
      if (coordinate) {

        this._scheduledCoordinate.x = coordinate.x;
        this._scheduledCoordinate.y = coordinate.y;
        
      } else {

        this._scheduledCoordinate.x = this.head.coordinate.x;
        this._scheduledCoordinate.y = this.head.coordinate.y;

        Connection.rooms.getById(this.roomId).broadcast("change direction", {
          pratyId: this.id,
          direction: this._scheduledDirection,
          coordinate: this._scheduledCoordinate
        }, this.userId);
        
      }
    }
  }

  nextStep() {
    this._reached = false;
    if (this._hasScheduledDirection()) {
      this._changeDirection();
    }
    this._targetForward(this.head);
  }

  _isArrived(deltaTime) {
    let destX =
      (this.head.coordinate.x * Configuration.isometric.unitWidth) / 2 -
      (this.head.coordinate.y * Configuration.isometric.unitWidth) / 2;

    let charX = this.head.x;
    let distanceLeft = this.head.direction < 2 ? destX - charX : charX - destX;

    return Math.abs(this._getVelocity(deltaTime).x) >= distanceLeft;
  }

  _finishStep() {
    // Ignore function call when head coordinate did not changed
    if (
      this._lastStep != null &&
      this._lastStep.x == this.head.coordinate.x &&
      this._lastStep.y == this.head.coordinate.y
    ) {
      return;
    }

    if (
      this._scheduledCoordinate.x != this.head.coordinate.x || 
      this._scheduledCoordinate.y != this.head.coordinate.y
    ) {
      this.displace(this._scheduledCoordinate, this._scheduledDirection);
      return;
    }

    this._lastStep = this._clone(this.head.coordinate);

    let position;
    for (let i = this.members.length - 1; i >= 0; i--) {
      let member = this.members[i];
      if (i > 0) {
        position = this.members[i - 1].targetPosition;
        if (this.members[i - 1].jump) {
          if (!member.jump && !this._justDisplaced) {
            member.jump = true;
          }
          member.direction = this.members[i - 1].direction;
          member.coordinate = this._clone(this.members[i - 1].coordinate);
        }
      } else {
        position = this._translateCoordinate(this.head.coordinate);
      }
      if (member.jump) {
        member.targetPosition.x = position.x;
        member.targetPosition.y = position.y;
        member.x = member.targetPosition.x;
        member.y = member.targetPosition.y;
      }
    }

    this._reached = true;
    this._justDisplaced = false;
  }

  _proceedStep(deltaTime) {
    for (let i = this.members.length - 1; i >= 0; i--) {
      let member = this.members[i];
      if (!member.jump) {
        continue;
      }
      let velocity = this._getVelocity(deltaTime, member.direction);
      member.x += velocity.x;
      member.y += velocity.y;
    }
  }

  _targetForward(member) {
    switch (member.direction) {
      case 0:
        member.coordinate.x++;
        break;
      case 1:
        member.coordinate.y--;
        break;
      case 2:
        member.coordinate.x--;
        break;
      case 3:
        member.coordinate.y++;
        break;
    }
    this._scheduledCoordinate.x = member.coordinate.x;
    this._scheduledCoordinate.y = member.coordinate.y;
  }

  _hasScheduledDirection() {
    return this._scheduledDirection >= 0;
  }

  _changeDirection() {
    if (this._scheduledDirection >= 0) {
      this.head.direction = this._scheduledDirection;
      this._scheduledDirection = -1;
    }
  }

  _getVelocity(deltaTime, direction = -1) {
    let velocityX = this.speed * deltaTime;
    let velocityY = (this.speed / 1.722) * deltaTime;

    if (direction < 0) {
      direction = this.head.direction;  
    }

    if (direction > 1) {
      velocityX = -velocityX;
    }

    if (direction > 0 && direction < 3) {
      velocityY = -velocityY;
    }

    return {
      x: velocityX,
      y: velocityY
    };
  }

  _translateCoordinate(coordinate) {
    let tx =
      (coordinate.x * Configuration.isometric.unitWidth) / 2 -
      (coordinate.y * Configuration.isometric.unitWidth) / 2;
    let ty =
      (coordinate.x * Configuration.isometric.unitHeight) / 2 +
      (coordinate.y * Configuration.isometric.unitHeight) / 2;

    return {
      x: tx,
      y: ty
    };
  }

  _clone(obj) {
    let newObj = {};
    let keys = Object.keys(obj);
    for (let key of keys) {
      newObj[key] = obj[key];
    }
    return newObj;
  }
}
