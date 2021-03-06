export default class Ticker {
  constructor () {
    
    this.targetFPMS = 0.06;
    this.targetElapsedMS = 16.66;
    this.deltaTime = 1;
    this.lastTime = -1;
    this.started = false;
    this.currentTimer = null;
    this.handlers = [];

  }

  add(fn) {
    this.handlers.push(fn);
  }

  remove(fn) {
    let idx = this.handlers.indexOf(fn);
    if (idx >= 0) this.handlers.splice(idx, 1);
  }

  start() {
    if (this.currentTimer === null && !this.started) {
      this.started = true;
      this.lastTime = Date.now();
      this.currentTimer = setTimeout(() => this._tick(), this.targetElapsedMS);
    }
  }

  stop() {
    if (this.started) {
      this.started = false;
      this.lastTime = Date.now();
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
  }

  delete() {
    this.stop();
    this.handlers = null;
  }

  _tick() {
    this.currentTimer = null;
    if (this.started) {
      this._update();
      if (this.started && this.currentTimer === null) {
        this.currentTimer = setTimeout(() => this._tick(), this.targetElapsedMS);
      }
    }
  }

  _update() {
    let currentTime = Date.now();

    if (currentTime > this.lastTime) {

      this.elapsedMS = currentTime - this.lastTime;
      this.deltaTime = this.elapsedMS * this.targetFPMS;

      for (let fn of this.handlers) {
        fn(this.deltaTime);
      }

    }

    this.lastTime = currentTime;
  }

}