import crypto from "crypto";

import Connection from "./Connection";

export default class Room {

  constructor(id, counts, team) {
    this.id = id;
    this.playerCounts = counts;
    this.isTeamGame = team;
    this.seed = crypto.randomBytes(16).toString('hex');

    this.players = [];
    this.leftPlayers = [];

    this.idList = [1, 2, 3, 4];
  }

  _pickId() {
    let idx = Math.floor(Math.random() * this.idList.length);
    let id = this.idList[idx];
    this.idList.splice(idx, 1);
    return id;
  }

  _getColor(partyId) {
    switch(partyId) {
      case 1:
        return 0x008744;
      case 2:
        return 0x0057e7;
      case 3:
        return 0xd62d20;
      case 4:
        return 0xffa700;
    }
  }

  addPlayer(player) {
    this.players.push(player);
    player.partyId = this._pickId();
    player.territoryColor = this._getColor(player.partyId);
    player.playingRoomId = this.id;
  }

  broadcast(event, data, notMeId = false) {

    for (let player of this.players) {
      if (player.socketId && player.id != notMeId) Connection.io.to(player.socketId).emit(event, data);
    }
  
  }

  connectedPlayers() {

    let userList = [];

    for (let player of this.players) {
      if (player.socketId) userList.push(player);
    }

    return userList;

  }

  deleteUser(userId) {
    for (let i in this.players) {
      if (this.players[i].id == userId) {
        this.players.splice(i, 1);
        this.leftPlayers.push(this.players[i]);
        break;
      }
    }
  }

}