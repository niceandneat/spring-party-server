import gen from 'random-seed'

export default class StageData {
  constructor(seed) {
    this.dimension = {
      width: 16,
      height: 16
    };
    let seed1 = seed.slice(0, seed.length / 2)
    let seed2 = seed.slice(seed.length / 2)
    this.territory = this._generateEmptyTerritory();
    this.terrain = this._generateTerrain(seed1);
    this.obstacles = this._generateObstacles(seed2);
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

  _generateTerrain(seed) {
    let i = 0;
    let terrain = [];
    for (let y = 0; y < this.dimension.height; y++) {
      terrain[y] = [];
      for (let x = 0; x < this.dimension.width; x++) {
        if (this.territory[y][x] > 0) continue;
        terrain[y][x] = gen(seed[i]) > 0.9 ? -1 : gen(seed[i+1]) > 0.3 ? 0 : 1;
        i = i + 2;
      }
    }
    return terrain;
  }

  _generateObstacles(seed) {
    let i = 0;
    let obstacles = [];
    for (let y = 0; y < this.dimension.height; y++) {
      obstacles[y] = [];
      for (let x = 0; x < this.dimension.width; x++) {
        if (this.territory[y][x] || this.terrain[y][x] == -1) continue;
        obstacles[y][x] =
          gen(seed[i]) > 0.98 ? Math.floor(gen(seed[i+1]) * 10) : 0;
        i = i + 2;
      }
    }
    return obstacles;
  }
}
