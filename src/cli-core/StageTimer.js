import Configuration from "./Configuration.js";

export default class StageTimer {
  constructor(seconds) {

    this._timeTotal = seconds;
    this._timeElapsed = 0;
    this._expired = false;

    this._onTimeDoneHandlers = [];
  }

  onTimeDone(handler) {
    this._onTimeDoneHandlers.push(handler);
  }

  update(deltaTime) {
    if (this._expired) {
      return;
    }

    this._timeElapsed += deltaTime / 60;
    if (this._timeElapsed >= this._timeTotal) {
      this._expired = true;
      for (let i = 0; i < this._onTimeDoneHandlers.length; i++) {
        this._onTimeDoneHandlers[i]();
      }
      return;
    }
  }

  _initializeTimer() {
    this._timeElapsed = 0;
    this._expired = false;
  }

}
