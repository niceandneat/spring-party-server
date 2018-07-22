class Room {

  constructor(id, counts, team) {
    this.id = id;
    this.playerCounts = counts;
    this.isTeamGame = team;

    this.players = [];
  }

  broadcast(io, event, data) {

    for (let player of this.players) {
      io.to(player.socketId).emit(event, data);
    }
  
  }

  connectedPlayers() {

    let userList = [];

    for (let player of this.players) {
      if (player.socketId) userList.push(player);
    }

    return userList;

  }

}

exports.Room = Room;