import crypto from "crypto";

import Room from "./Room";

export default class RoomList {

  constructor() {
    this.roomIdMap = new Map();
    this.roomList = [];
  }

  create(counts, team, players) {
    let room = new Room(this._generateUid(), counts, team, players);
    this.roomIdMap.set(room.id, room);
    this.roomList.push(room);
    return room;
  }

  remove(roomId) {
      
    let room = this.getById(roomId);
    if (room) {
      // room.close();
      this.roomList.splice(this.roomList.indexOf(room), 1);
      this.roomIdMap.delete(room.id);
    }
  }

  exists(roomId) {
    return this.roomIdMap.has(roomId);
  }

  getById(roomId) {
    return this.roomIdMap.get(roomId);
  }

  update(deltaTime) {
    for (let room of this.roomList) {
      room.update(deltaTime);
    }
  }

  _generateUid() {
    let uid;
    do {
      uid = crypto.createHash('sha256').update(Math.random().toString(36)).digest('hex');
    } while (this.roomIdMap.has(uid));
    return uid;
  }
}