import StageData from "./StageData.js";
import StageTerritory from "./StageTerritory.js";
import Configuration from "./Configuration.js";
import StageTimer from "./StageTimer.js";

export default class Stage {
  constructor(stageData) {

    /**
     * Metadata for stage
     */
    this.meta = stageData;
    this.roomId = null;

    // Parties in this stage
    this._parties = [];

    // Territory
    this._territory = null;

    // Timer
    this._timer = null;

    this._initializeTerritory();
    this._createTimer(120);
  }

  get parties() {
    return this._parties;
  }

  get timer() {
    return this._timer;
  }

  get territory() {
    return this._territory;
  }

  /**
   * Make real-time updates in stage
   */
  update(deltaTime) {
    // Update parties
    for (let i = 0; i < this._parties.length; i++) {
      let party = this._parties[i];

      party.update(deltaTime);

      // If party reached next tile,
      if (party.reached) {
        // Evaluate hit boundary
        let hitBoundary = this._getHitBoundary(party.head.coordinate);

        //If it hit obstacle or out of bound,
        if (hitBoundary.indexOf(party.nextDirection) >= 0) {
          this._territory.removeLine(party.id);
          this.damageParty(party, 10);
        }

        // Let's roll'in
        else {
          let nextDirection =
            party.scheduledDirection < 0
              ? party.direction
              : party.scheduledDirection;
          this._territory.step(
            party.id,
            party.head.coordinate,
            party.direction,
            nextDirection
          );
          // Go next!
          party.nextStep();
        }
      }
    }

    // Update timer
    this._timer.update(deltaTime);
  }

  damageParty(party, damage) {
    party.damage(damage);
    party.halt(0.4, () => {
      party.displaceToStartCoordinate();
    });
  }

  /**
   * Add new party to stage
   */
  addParty(party) {
    this._parties.push(party);
  }

  /**
   * Territory data
   */
  _initializeTerritory() {
    this._territory = new StageTerritory(
      this.meta.dimension.width,
      this.meta.dimension.height
    );
    for (let y = 0; y < this._territory.height; y++) {
      for (let x = 0; x < this._territory.width; x++) {
        if (this.meta.territory[y][x] > 0) {
          this._territory.occupy(this.meta.territory[y][x], { x: x, y: y });
        }
      }
    }

    this._territory.onHitLine((partyId, hitPartyId) => {
      this._onPartyHitLine(partyId, hitPartyId);
    });

    this._territory.onOccupy((partyId, changes) => {
      this._onPartyOccupy(partyId, changes);
    });
  }

  _createTimer(seconds) {
    this._timer = new StageTimer(seconds);
  }

  _getHitBoundary(coordinate) {
    if (coordinate.y < 0 || coordinate.y >= this.meta.terrain.length) {
      return [0, 1, 2, 3];
    }
    if (
      coordinate.x < 0 ||
      coordinate.x >= this.meta.terrain[coordinate.y].length
    ) {
      return [0, 1, 2, 3];
    }

    let boundary = [];

    if (coordinate.y == 0) boundary.push(1);
    if (coordinate.x == 0) boundary.push(2);
    if (coordinate.y == this.meta.dimension.height - 1) boundary.push(3);
    if (coordinate.x == this.meta.dimension.width - 1) boundary.push(0);

    // TODO: check whether it is an obstacle
    if (this.meta.obstacles[coordinate.y][coordinate.x] > 0) {
      return [0, 1, 2, 3];
    }

    return boundary;
  }

  _onPartyHitLine(subjectId, objectId) {
    let subjectParty;
    let objectParty;
    // Find party
    for (let i = 0; i < this._parties.length; i++) {
      if (this._parties[i].id == subjectId) {
        subjectParty = this._parties[i];
      }
      if (this._parties[i].id == objectId) {
        objectParty = this._parties[i];
      }
    }

    // If it hit it's line
    this.damageParty(objectParty, 10);
  }

  _onPartyOccupy(partyId, changes) {
    // 만약 적이 먹은 영역에 내가 있다면, die!
  }

}
