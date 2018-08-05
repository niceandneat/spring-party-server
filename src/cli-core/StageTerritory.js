import Pathfinder from "./Pathfinder";

export default class StageTerritory {
  constructor(width, height) {
    // Territory size
    this._width = width;
    this._height = height;

    // Ownership data
    this._grid = null;
    this._edgeGrid = null;

    // Pathfinder
    this._pathfinder = null;

    // Event handlers
    this._onHitLineHandler = [];
    this._onOccupyHandler = [];

    this._initialize();
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get ownership() {
    return this._grid;
  }

  get line() {
    return this._line;
  }

  onHitLine(handler) {
    this._onHitLineHandler.push(handler);
  }

  onOccupy(handler) {
    this._onOccupyHandler.push(handler);
  }

  get(x, y) {
    return this._grid[y][x];
  }

  occupy(partyId, coordinate) {
    let changes = [];
    let tile = this._grid[coordinate.y][coordinate.x];
    if (tile.owner != partyId) {
      tile.owner = partyId;
      changes.push(tile);
    }

    // 인접한 타일이 다른 타일이면
    this._updateEdges(
      coordinate.x - 1,
      coordinate.y - 1,
      coordinate.x + 1,
      coordinate.y + 1
    );

    return changes;
  }

  view() {
    for (let y = 0; y < this._height; y++) {
      let ss = "(" + y + ")  ";
      for (let x = 0; x < this._width; x++) {
        let tile = this._grid[y][x];
        ss +=
          tile.owner +
          (tile.lineOwner > 0 ? "|" + tile.lineOwner + "|" : "") +
          "   ";
      }
      console.log(ss);
    }
    console.log("");
  }

  step(partyId, coordinate, direction, nextDirection) {
    let changes = [];
    let tile = this._grid[coordinate.y][coordinate.x];

    // 만약 내 영역이면서, 가장자리이면
    if (tile.owner == partyId && this._edgeGrid[tile.y][tile.x] == partyId) {
      // 밖에서 안으로 들어오는거면
      let adjacentLinedTiles = this._adjacentLinedTiles(tile, false);

      if (adjacentLinedTiles.length > 0) {
        // 폐곡면이라면
        let closedLoop = this._pathfinder.findPath(
          partyId,
          adjacentLinedTiles[0],
          tile
        );
        if (closedLoop.length > 0) {
          changes = changes.concat(this._fillArea(partyId, closedLoop));
        }
      }
    }

    ///////// 다른 사람 영역 전체 먹었을때도 포함

    // 다른 선을 밟는다면
    if (tile.lineOwner > 0) {
      let lineOwner = tile.lineOwner;

      changes = changes.concat(this.removeLine(tile.lineOwner));
      // Dispatch!
      for (let i = 0; i < this._onHitLineHandler.length; i++) {
        this._onHitLineHandler[i](partyId, lineOwner);
      }
      if (lineOwner == partyId) {
        return changes;
      }
    }

    // 만약 다른 사람 땅이거나, 점령되지 않은 지역이라면
    if (tile.owner != partyId) {
      tile.lineOwner = partyId;
      tile.lineCode = this._getLineSubcode(direction, nextDirection);
      changes.push(tile);
    }

    return changes;
  }

  _initialize() {
    this._grid = [];
    this._edgeGrid = [];
    for (let y = 0; y < this._height; y++) {
      this._grid[y] = [];
      this._edgeGrid[y] = [];
      for (let x = 0; x < this._width; x++) {
        this._grid[y][x] = new TerritoryTile(x, y);
        this._edgeGrid[y][x] = 0;
      }
    }
    this._pathfinder = new Pathfinder();
    this._pathfinder.setGrid(this._grid, this._edgeGrid);
  }

  removeLine(partyId) {
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        let tile = this._grid[y][x];
        if (tile.lineOwner == partyId) {
          tile.lineOwner = 0;
          tile.lineCode = 0;
        }
      }
    }
  }

  _fillArea(partyId, path) {
    let lineHitParties = [];
    let fillArea = [];
    let fillAreaWidth = 0;
    let fillAreaHeight = 0;
    let fillAreaOffsetX = path[0].x;
    let fillAreaOffsetY = path[0].y;

    // Determine offset, Update opponent's edge
    for (let i = 0; i < path.length; i++) {
      fillAreaWidth = Math.max(path[i].x + 1, fillAreaWidth);
      fillAreaHeight = Math.max(path[i].y + 1, fillAreaHeight);
      fillAreaOffsetX = Math.min(path[i].x, fillAreaOffsetX);
      fillAreaOffsetY = Math.min(path[i].y, fillAreaOffsetY);
    }
    fillAreaWidth -= fillAreaOffsetX;
    fillAreaHeight -= fillAreaOffsetY;

    // Initialize fillarea
    for (let y = 0; y < fillAreaHeight * 3; y++) {
      fillArea[y] = [];
      for (let x = 0; x < fillAreaWidth * 3; x++) {
        fillArea[y][x] = 0;
      }
    }

    // Create specified space, Update path edge
    for (let i = 0; i < path.length; i++) {
      let ppath = i == 0 ? path[path.length - 1] : path[i - 1];
      let cpath = path[i];
      let npath = i == path.length - 1 ? path[0] : path[i + 1];

      let px = (cpath.x - fillAreaOffsetX) * 3;
      let py = (cpath.y - fillAreaOffsetY) * 3;

      let dpx = cpath.x - ppath.x;
      let dpy = cpath.y - ppath.y;
      let dnx = cpath.x - npath.x;
      let dny = cpath.y - npath.y;

      if (dpx != 0) {
        fillArea[py + 1][px + (dpx > 0 ? 0 : 2)] = 1;
      } else {
        fillArea[py + (dpy > 0 ? 0 : 2)][px + 1] = 1;
      }
      if (dnx != 0) {
        fillArea[py + 1][px + (dnx > 0 ? 0 : 2)] = 1;
      } else {
        fillArea[py + (dny > 0 ? 0 : 2)][px + 1] = 1;
      }

      fillArea[py + 1][px + 1] = 1;
    }

    // Pick flood point
    let floodFillSeed = { x: 0, y: 0 };
    for (let x = 0; x < fillAreaWidth; x++) {
      if (fillArea[1][x * 3 + 1] > 0) {
        floodFillSeed.x = x * 3 + 2;
        floodFillSeed.y = 2;
        break;
      }
    }
    // Flood fill
    let queueX = [floodFillSeed.x];
    let queueY = [floodFillSeed.y];
    while (queueY.length) {
      let currentX = queueX.pop();
      let currentY = queueY.pop();
      if (fillArea[currentY][currentX] > 0) {
        continue;
      }
      let west = 0,
        east = 0;
      while (west <= currentX && fillArea[currentY][currentX - west] < 1) {
        west++;
      }
      west--;
      let traverseX = currentX + east - west;
      while (
        east - west + currentX < fillAreaWidth * 3 &&
        fillArea[currentY][traverseX] < 1
      ) {
        fillArea[currentY][traverseX] = 1;
        if (currentY > 0 && fillArea[currentY - 1][traverseX] < 1) {
          queueX.push(currentX + east - west);
          queueY.push(currentY - 1);
        }
        if (
          currentY < fillAreaHeight * 3 - 1 &&
          fillArea[currentY + 1][traverseX] < 1
        ) {
          queueX.push(currentX + east - west);
          queueY.push(currentY + 1);
        }
        east++;
        traverseX = currentX + east - west;
      }
    }

    // 9-point merge
    for (let y = 0; y < fillAreaHeight; y++) {
      for (let x = 0; x < fillAreaWidth; x++) {
        if (fillArea[y * 3 + 1][x * 3 + 1] > 0) {
          let gx = x + fillAreaOffsetX;
          let gy = y + fillAreaOffsetY;
          let grid = this._grid[gy][gx];
          if (
            grid.lineOwner > 0 &&
            grid.lineOwner != partyId &&
            lineHitParties.indexOf(grid.lineOwner) < 0
          ) {
            lineHitParties.push(grid.lineOwner);
          }
          grid.lineOwner = 0;
          if (grid.owner != partyId) {
            grid.owner = partyId;
          }
        }
      }
    }
    this._updateEdges(
      fillAreaOffsetX - 1,
      fillAreaOffsetY - 1,
      fillAreaOffsetX + fillAreaWidth + 1,
      fillAreaOffsetY + fillAreaHeight + 1
    );

    // Dispatch onOccupy
    for (let i = 0; i < this._onOccupyHandler.length; i++) {
      this._onOccupyHandler[i](partyId);
    }

    for (let i = 0; i < lineHitParties.length; i++) {
      for (let j = 0; j < this._onHitLineHandler.length; j++) {
        this.removeLine(lineHitParties[i]);
        this._onHitLineHandler[j](partyId, lineHitParties[i]);
      }
    }
    
  }

  _updateEdges(startX, startY, endX, endY) {
    startX = Math.max(startX || 0, 0);
    startY = Math.max(startY || 0, 0);
    endX = Math.min(endX || this._width, this._width);
    endY = Math.min(endY || this._height, this._height);
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        let grid = this._grid[y][x];
        if (grid.owner < 1) {
          continue;
        }
        this._edgeGrid[y][x] = 0;
        let js = y < 1 ? 0 : -1,
          je = y >= this._height - 1 ? 0 : 1;
        let ks = x < 1 ? 0 : -1,
          ke = x >= this._width - 1 ? 0 : 1;
        for (let j = js; j <= je; j++) {
          for (let k = ks; k <= ke; k++) {
            if (this._grid[y + j][x + k].owner != grid.owner) {
              this._edgeGrid[y][x] = grid.owner;
              break;
            }
          }
        }
      }
    }
  }

  _adjacentLinedTiles(targetTile, detectEdge = false) {
    if (!this._tileChecker) {
      this._tileChecker = [1, 0, -1, 0, 0, 1, 0, -1];
    }
    let adjacentTiles = [];
    for (let i = 0; i < 4; i++) {
      let x = targetTile.x + this._tileChecker[i * 2];
      let y = targetTile.y + this._tileChecker[i * 2 + 1];
      if (x >= 0 && x < this._width && y >= 0 && y < this._height) {
        let tile = this._grid[y][x];
        if (
          (tile.lineOwner == targetTile.owner && tile.lineOwner > 0) ||
          (detectEdge &&
            this._edgeGrid[y][x] == targetTile.owner &&
            tile.owner == targetTile.owner)
        ) {
          adjacentTiles.push(tile);
        }
      }
    }
    return adjacentTiles;
  }

  _getLineSubcode(direction, nextDirection) {
    // Forward, march
    if (direction == nextDirection) {
      if (direction == 1 || direction == 3) {
        return 1;
      } else {
        return 2;
      }
    }

    // Righttime, march
    else {
      if (
        (direction == 0 && nextDirection == 1) ||
        (direction == 3 && nextDirection == 2)
      ) {
        return 3;
      } else if (
        (direction == 3 && nextDirection == 0) ||
        (direction == 2 && nextDirection == 1)
      ) {
        return 4;
      } else if (
        (direction == 2 && nextDirection == 3) ||
        (direction == 1 && nextDirection == 0)
      ) {
        return 5;
      } else {
        return 6;
      }
    }
  }
}

class TerritoryTile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.owner = 0;
    this.lineOwner = 0;
    this.lineCode = 0;
  }
}