import EasyStar from "easystarjs";

export default class PartySimulator {
  constructor(party, territory, obstacles) {

    // Basic data to evaluate
    this._party = party;
    this._territory = null;
    this._obstacles = null;

    // Change party status to AI
    this._party.isAi = true;

    // Pathfinder
    this._pathfinder = null;
    this._findLimit = 4;

    // Current status
    this._plannedPath = [];
    this._plannedPathIndex = 0;

    this._onActionHandlers = [];

    this._party.onEliminate((member, deadly) => {
      if (deadly) {
        this._pathfinder = null;
      }
      this.clear();
    });

    this._party.onDisplaced(coordinate => {
      this.clear();
    });
  }

  setEnvironment(territory, obstacles) {
    this._territory = territory;
    this._obstacles = obstacles;
    this._initializePathfinder();

    this._territory.onOccupy((party, changes) => {
      if (party == this._party.id) {
        this.clear();
      }
    });
  }

  onAction(handler) {
    this._onActionHandlers.push(handler);
  }

  update(deltaTime) {
    if (this._pathfinder == null) {
      return;
    }

    if (this._plannedPathIndex >= this._plannedPath.length) {
      if (Math.random() > 0.5) {
        this._findLimit = 4;
      }
      this._planPath(0, this._findLimit);
    }

    // 길대로 따라가자

    if (this._party._isArrived(deltaTime)) {
      let pcoord = this._party.head.coordinate;

      let curr = pcoord;
      let next = this._plannedPath[this._plannedPathIndex];

      if (this._party.id == 1) console.log(curr.x, curr.y, next.x, next.y);

      let ndir = 0;

      if (next.x > curr.x) {
        ndir = 0;
      } else if (next.x < curr.x) {
        ndir = 2;
      } else if (next.y > curr.y) {
        ndir = 3;
      } else {
        ndir = 1;
      }

      // 방향전환이 있으면,
      if (ndir != this._party.direction) {
        for (let i = 0; i < this._onActionHandlers.length; i++) {
          // setTimeout(() => {
          this._onActionHandlers[i](ndir, next);
          //}, 300 * Math.random());
        }
      }
      this._plannedPathIndex++;

    }

  }
  _planPath(startLimit, endLimit) {
    let currentStep = this._party.head.coordinate;

    let preferredSteps = [];

    // treaverse near area
    let esx = Math.max(0, currentStep.x - endLimit);
    let eex = Math.min(this._territory.width - 1, currentStep.x + endLimit);
    let esy = Math.max(0, currentStep.y - endLimit);
    let eey = Math.min(this._territory.height - 1, currentStep.y + endLimit);

    let ssx = Math.max(0, currentStep.x - startLimit);
    let sex = Math.min(this._territory.width - 1, currentStep.x + startLimit);
    let ssy = Math.max(0, currentStep.y - startLimit);
    let sey = Math.min(this._territory.height - 1, currentStep.y + startLimit);

    for (let y = esy; y <= eey; y++) {
      if (y == currentStep.y) {
        continue;
      }

      for (let x = esx; x <= eex; x++) {
        if (x == currentStep.x) {
          continue;
        }

        // Too close
        if (x >= ssx && x <= sex && y >= ssy && y <= sey) {
          continue;
        }
        //console.log(x, y)
        // Is occupiable
        if (
          this._isOccupiable(x, y) &&
          this._isOccupiable(currentStep.x, y) &&
          this._isOccupiable(x, currentStep.y)
        ) {
          preferredSteps.push({ x: x, y: y });
        }
      }
    }

    // If not found, increase traverse area
    if (preferredSteps.length < 1) {
      if (
        endLimit >= this._territory.width ||
        endLimit >= this._territory.height
      ) {
        preferredSteps.push({
          x: Math.floor((this._territory.width - 1) * Math.random()),
          y: Math.floor((this._territory.height - 1) * Math.random())
        });
      } else {
        this._findLimit *= 2;
        this._planPath(endLimit, this._findLimit);
        return;
      }
    }
    //console.log(preferredSteps)
    // Random select from the possible steps
    let selectedStep =
      preferredSteps[Math.floor((preferredSteps.length - 1) * Math.random())];
    // Target coordinates
    let tcoord = [];
    tcoord.push({
      x: currentStep.x,
      y: currentStep.y
    });
    tcoord.push({
      x: selectedStep.x,
      y: currentStep.y
    });
    tcoord.push({
      x: selectedStep.x,
      y: selectedStep.y
    });
    tcoord.push({
      x: currentStep.x,
      y: selectedStep.y
    });
    tcoord.push({
      x: currentStep.x,
      y: currentStep.y
    });

    if (Math.random() > 0.5) {
      let temp = tcoord[1];
      tcoord[1] = tcoord[3];
      tcoord[3] = temp;
    }

    // Interpolate!
    for (let i = 0; i < tcoord.length - 1; i++) {
      this._pathfinder.findPath(
        tcoord[i].x,
        tcoord[i].y,
        tcoord[i + 1].x,
        tcoord[i + 1].y,
        pathFound => {
          if (pathFound != null && pathFound.length > 0) {
            this._plannedPath = this._plannedPath.concat(pathFound.slice(1));
          }
        }
      );
      this._pathfinder.calculate();
    }

    // REMOVE TAILING
    let cleaned = [];
    cleaned.push(this._plannedPath[0]);
    for (let i = 1; i < this._plannedPath.length - 1; i++) {
      let prv = this._plannedPath[i - 1];
      let now = this._plannedPath[i];
      let nex = this._plannedPath[i + 1];

      if (prv.x == nex.x && prv.y == nex.y) {
        i += 2;
        continue;
      } else {
        cleaned.push(now);
        if (i == this._plannedPath.length - 2) {
          cleaned.push(nex);
        }
      }
    }
    this._plannedPath = cleaned;

    this._plannedPathIndex = 0;
  }

  _isOccupiable(x, y) {
    let territory = this._territory.get(x, y);
    if (territory.owner != this._party.id) {
      if (this._obstacles[y][x] == 0) {
        return true;
      }
    }
    return false;
  }

  _initializePathfinder() {
    this._pathfinder = new EasyStar.js();
    this._pathfinder.enableSync();
    this._pathfinder.setGrid(this._obstacles);
    this._pathfinder.setAcceptableTiles([0]);
  }

  clear() {
    this._plannedPath = [];
  }
}
