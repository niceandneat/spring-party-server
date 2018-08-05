export default class Pathfinder {
  constructor() {
    // Grid instances
    this._grid = null;
    this._edgeGrid = null;
    this._gridWidth = 0;
    this._gridHeight = 0;
    this._gridSize = 0;

    this._context = 0;
  }

  setGrid(grid, edgeGrid) {
    this._grid = grid;
    this._edgeGrid = edgeGrid;
    this._gridWidth = grid[0].length;
    this._gridHeight = grid.length;
    this._gridSize = this._gridWidth * this._gridHeight;
  }

  findPath(partyId, start, end) {
    let forbiddenMove = 0;
    if (start.x > end.x) forbiddenMove = 0;
    else if (start.x < end.x) forbiddenMove = 1;
    else if (start.y > end.y) forbiddenMove = 2;
    else forbiddenMove = 3;

    this._context = {
      party: partyId,
      start: start,
      end: end,
      forbiddenMove: forbiddenMove
    };

    let pathStart = new PathfinderNode(null, start.x, start.y, this._gridWidth);
    let pathEnd = new PathfinderNode(null, end.x, end.y, this._gridWidth);
    let visited = new Array(this._gridSize);

    var open = [pathStart];
    var closed = [];
    var result = [];
    let step;
    let length, max, min, i, j;

    while ((length = open.length)) {
      max = this._gridSize;
      min = -1;
      for (i = 0; i < length; i++) {
        if (open[i].f < max) {
          max = open[i].f;
          min = i;
        }
      }
      let node = open.splice(min, 1)[0];
      if (node.value === pathEnd.value) {
        step = closed[closed.push(node) - 1];
        do {
          result.push({ x: step.x, y: step.y });
        } while ((step = step.parent));
        visited = closed = open = [];
        result.reverse();
      } else {
        let neighbours = this._neighbors(node.x, node.y);
        for (i = 0, j = neighbours.length; i < j; i++) {
          step = new PathfinderNode(
            node,
            neighbours[i].x,
            neighbours[i].y,
            this._gridWidth
          );
          if (!visited[step.value]) {
            step.g = node.g + this._distance(neighbours[i], node);
            step.f = step.g + this._distance(neighbours[i], pathEnd);
            open.push(step);
            visited[step.value] = true;
          }
        }
        closed.push(node);
      }
    }
    return result;
  }

  _distance(point, goal) {
    return Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y);
  }

  _neighbors(x, y) {
    let approachable = [true, true, true, true];
    if (this._context.start.x == x && this._context.start.y == y) {
      approachable[this._context.forbiddenMove] = false;
    }
    if (this._grid[y][x].lineOwner == this._context.party) {
      switch (this._grid[y][x].lineCode) {
        case 1: // north and south
          approachable[0] = false;
          approachable[1] = false;
          break;
        case 2: // west and east
          approachable[2] = false;
          approachable[3] = false;
          break;
        case 3: // north and west
          approachable[1] = false;
          approachable[3] = false;
          break;
        case 4: // north and east
          approachable[0] = false;
          approachable[3] = false;
          break;
        case 5: // south and east
          approachable[0] = false;
          approachable[2] = false;
          break;
        case 6: // south and west
          approachable[1] = false;
          approachable[2] = false;
          break;
      }
    }

    let N = y - 1,
      S = y + 1,
      E = x + 1,
      W = x - 1,
      myN = N > -1 && this._steppable(x, N) && approachable[2],
      myS = S < this._gridHeight && this._steppable(x, S) && approachable[3],
      myE = E < this._gridWidth && this._steppable(E, y) && approachable[1],
      myW = W > -1 && this._steppable(W, y) && approachable[0],
      result = [];
    if (myN) result.push({ x: x, y: N });
    if (myE) result.push({ x: E, y: y });
    if (myS) result.push({ x: x, y: S });
    if (myW) result.push({ x: W, y: y });
    return result;
  }

  _steppable(x, y) {
    return (
      this._grid[y][x].lineOwner == this._context.party ||
      this._edgeGrid[y][x] == this._context.party
    );
  }
}

class PathfinderNode {
  constructor(parent, x, y, width) {
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.f = 0;
    this.g = 0;
    this.value = y * width + x;
  }
}
