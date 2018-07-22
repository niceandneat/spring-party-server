class User {

  constructor(id, status, socketId) {

    this.id = id;
    this.status = status;
    this.socketId = socketId;

    this.playingRoom = null;

  }

}

exports.User = User;