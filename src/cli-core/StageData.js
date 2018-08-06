let gen = require("random-seed");

export default class StageData {
  constructor(seed) {
    this.dimension = {
      width: 16,
      height: 16
    };
    this.seed = seed;
    this.random = gen(this.seed);
    this.territory = this._generateEmptyTerritory();
    this.terrain = this._generateTerrain();
    this.obstacles = this._generateObstacles();
  }

  _generateEmptyTerritory() {
    let territory = [];
    for (let y = 0; y < this.dimension.height; y++) {
      territory[y] = [];
      for (let x = 0; x < this.dimension.width; x++) {
        if (y < 3 && x < 3) {
          territory[y][x] = 2;
        } else if (y < 3 && x > this.dimension.width - 4) {
          territory[y][x] = 1;
        } else if (
          y > this.dimension.height - 4 &&
          x > this.dimension.width - 4
        ) {
          territory[y][x] = 4;
        } else if (y > this.dimension.height - 4 && x < 3) {
          territory[y][x] = 3;
        } else {
          territory[y][x] = 0;
        }
      }
    }
    return territory;
  }

  _generateTerrain() {
    let terrain = [];
    for (let y = 0; y < this.dimension.height; y++) {
      terrain[y] = [];
      for (let x = 0; x < this.dimension.width; x++) {
        if (this.territory[y][x] > 0) {
          terrain[y][x] = 0;
          continue;
        }
        terrain[y][x] = this.random(100) > 90 ? -1 : this.random(100) > 30 ? 0 : 1;
      }
    }
    return terrain;
  }

  _generateObstacles(seed) {
    let obstacles = [];
    for (let y = 0; y < this.dimension.height; y++) {
      obstacles[y] = [];
      for (let x = 0; x < this.dimension.width; x++) {
        if (this.territory[y][x] || this.terrain[y][x] == -1) {
          obstacles[y][x] = 0;
          continue;
        }
        obstacles[y][x] = this.random(100) > 95 ? Math.floor(this.random(100) * 0.1) : 0;
      }
    }
    return obstacles;
  }
}
