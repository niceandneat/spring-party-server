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

    this._initialize();
  }

  _initialize() {

    let idList = [1, 2, 3, 4];

    // Create player party info
    for (let player of this.players) {

      player.partyId = this._pickId(idList);
      player.territoryColor = this._getColor(player.partyId);

    }

  }

  _pickId(idList) {
    let idx = Math.floor(Math.random() * idList.length);
    let id = idList[idx];
    idList.splice(idx, 1);
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