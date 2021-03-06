export default class User {

  constructor(id, status, socketId) {

    this.id = id;
    this.status = status;
    this.socketId = socketId;

    this.partyCode = null;
    this.partyId = null;
    this.territoryColor = null;

    this.timer = null;
    this.playingRoomId = null;

  }

  setTimer(seconds, callback) {

    this.unsetTimer();

    this.timer = setTimeout(callback, seconds * 1000);

  }

  unsetTimer() {

    if (this.timer) {
      clearTimeout(this.timer);
    }

  }

}

exports.User = User;