let User = require("./User").User;

class UserList {

  constructor() {
    this.userIdMap = new Map();
    this.userList = [];
  }

  register(id, status, socketId) {
    let user = new User(id, status, socketId);
    this.userIdMap.set(user.id, user);
    this.userList.push(user);
    return user;
  }

  remove(userId) {
    let user = this.getById(userId);
    if (user) {
      this.userList.splice(this.userList.indexOf(user), 1);
      this.userIdMap.delete(user.id);
    }
  }

  exists(userId) {
    return this.roomIdMap.has(userId);
  }

  getById(userId) {
    return this.userIdMap.get(userId);
  }

  getBySocketId(socketId) {

    for (let i = 0; i < this.userList.length; i++) {
      if (this.userList[i].socketId == socketId) {
        return this.userList[i];
      }
    }

    return;
  }

}

exports.UserList = UserList;