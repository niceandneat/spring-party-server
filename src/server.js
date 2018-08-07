import mysql from "mysql";

import Connection from "./Connection";
import QueryHandler from "./QueryHandler";
import UpdateHandler from "./UpdateHandler";


Connection.setup();

// game room list
let rooms = Connection.rooms;

// game user list
let users = Connection.users;

// socket connection
let io = Connection.io;

// user match find queue
let waitingQueues = {
  soloTwo: [],
  soloFour: [],
  teamFour: []
}

// set timeout
// var RECONNECT_TIMEOUT = 5;

function conditionQueryString(column, value) {
  return column + " = " + "'" + value + "'";
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

io.on("connection", function (socket) {

  // new socket
  console.log("Connection to socket <%s> established", socket.id);
  
  // sign up
  socket.on("creat user", (data) => {

    /**
     * id : id input
     * password : password input
     */
    
    let connnectionData = {
      socket: socket,
      db: Connection.db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user",
      condition: null,
      contents: null
    };

    QueryHandler.selectQuery(connnectionData, queryData, UpdateHandler.signUp);

  });

  // sign in
  socket.on("establish session", (data) => {

    /**
     * id : id input
     * password : password input
     * isAuto : auto sign in bool
     */

    let connnectionData = {
      socket: socket,
      db: Connection.db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user",
      condition: null,
      contents: null
    };

    QueryHandler.selectQuery(connnectionData, queryData, UpdateHandler.signIn);

  });

  // after sign in, send user's data
  socket.on("fetch user", (data) => {

    /**
     * userId : user who requested
     */

    let connnectionData = {
      socket: socket,
      db: Connection.db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user_gamedata",
      condition: conditionQueryString("user_id", data.userId),
      contents: null
    };

    QueryHandler.selectQuery(connnectionData, queryData, UpdateHandler.sendUserData);

  });

  // update user data
  socket.on("update user", (data) => {

    /**
     * userId : user who requested
     * contents : user data that need to be updated
     */
    
    // check user validation
    if (users.getById(data.userId).socketId != socket.id) {
      console.log("Unverified request from <%s>", data.userId);
      return;
    }

    let connnectionData = {
      socket: socket,
      db: Connection.db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user_gamedata",
      condition: conditionQueryString("user_id", data.userId),
      contents: data.contents
    };

    QueryHandler.updateQuery(connnectionData, queryData);

  });

  // find match
  socket.on("find match", (data) => {

    /**
     * userId : user who requested
     * partyCode : partyCode
     * playerCounts : room player counts
     * isTeam : weather team match bool
     */

    // requested user
    let user = users.getById(data.userId);

    // check user status
    if (user.status != "ready") return;

    console.log("request for finding match from <%s>", data.userId);

    // distinguish user's target game category
    let currentQueue;
    if (data.isTeam) {
      currentQueue = waitingQueues.teamFour;
    } else {
      if (data.playerCounts === 4) {
        currentQueue = waitingQueues.soloFour;
      } else if (data.playerCounts === 2) {
        currentQueue = waitingQueues.soloTwo;
      }
    }

    // add to waiting queue
    currentQueue.push(user);

    // change user status
    user.status = "wait";
    user.partyCode = data.partyCode;
    
    if (currentQueue.length === data.playerCounts) {
      
      // make new room in room list
      let room = rooms.create(data.playerCounts, data.isTeam);
      console.log("<%s> room created for:", room.id);

      // push players in room's player list
      let queueLength = currentQueue.length;

      for (let i = 0; i < queueLength; i++) {
        let player = currentQueue.shift();
        room.addPlayer(player);
        player.status = "play";
        console.log(player.id);
      }

      // send success massage
      room.broadcast("find match", {
        success: true,
        roomData: {
          id: room.id,
          seed: room.seed,
          players: room.connectedPlayers()
        }
      });

    }

  });

  socket.on("cancel finding", (data) => {

    /**
     * userId : user who requested
     * playerCounts : room player counts
     * isTeam : weather team match bool
     */

    // requested user
    let user = users.getById(data.userId);

    // check user status
    if (user.status != "wait") return;

    console.log("cancel request for finding match from <%s>", data.userId);

    // change user status
    user.status = "ready";

    // delete user from queue
    let keys = Object.keys(waitingQueues);

    for (let i = 0; i < keys.length; i++) {
      let index = waitingQueues[keys[i]].indexOf(user(data.userId));
      if (index != -1) {
        waitingQueues[keys[i]].splice(index, 1);
      }
    }

    // socket.emit("cancel finding", {
    //   success: true
    // });
    
  });

  socket.on("end game", (data) => {

    /**
     * userId: userId,
     * userRank: userRank,
     * rank: {userId, rank} list,
     * stats: kills, relics, score, lives
     */

    // requested user
    let user = users.getById(data.userId);

    // check user status
    if (user.status != "play") return;

    console.log("end game request from <%s>", data.userId);

    let connnectionData = {
      socket: socket,
      db: Connection.db,
      users: users,
      data: data
    };

    let room = rooms.getById(user.playingRoomId);

    room.deleteUser(user.id);

    let rewards = [];
    let totalCoin = 0;
    let characterCode = Math.floor(Math.random() * 22);

    rewards.push({
      type: "character",
      characterData: characterCode
    });

    for (let i = 0; i < 2; i++) {
      let coinIncrement = Math.floor(Math.random() * 5) * 10 + 50;
      rewards.push({ type: "coin", amount: coinIncrement });
      totalCoin += coinIncrement;
    };

    rewards = shuffle(rewards);

    let coinQueryString = "`coin` + " + totalCoin;
    let cardQueryString = "CONCAT(`card`, '," + characterCode + "')";

    QueryHandler.updateQuery(connnectionData, {
      table: "user_gamedata", 
      contents: {
        coin: mysql.raw(coinQueryString),
        card: mysql.raw(cardQueryString)
      }, 
      condition: conditionQueryString("user_id", user.id)
    });

    QueryHandler.updateQuery(connnectionData, {
      table: "user_gamestat", 
      contents: room.playerCounts == 4 ?
      {
        total_games_played: mysql.raw("`total_games_played` + 1"),
        solo_four_games_played : mysql.raw("`solo_four_games_played` + 1")
      } : {
        total_games_played: mysql.raw("`total_games_played` + 1"),
        solo_two_games_played : mysql.raw("`solo_four_games_played` + 1")
      }, 
      condition: conditionQueryString("user_id", user.id)
    });

    socket.emit("end game", {
      rewards: rewards
    });

    if (room.players.length == 0) {

      QueryHandler.insertQuery(connnectionData, {
        table: "gamelog", 
        contents: {
          room_id: room.id,
          rank: data.rank.join(),
          seed: room.seed
          }
        }
      );
  
      console.log("Room <%s> deleted",room.id);
      rooms.roomList.splice(rooms.roomList.indexOf(room), 1);
      rooms.roomIdMap.delete(room.id);
    }

    user.status = "ready";
    user.playingRoomId = null;

  });

  socket.on("disconnect", () => {

    console.log("socket <%s> disconnected", socket.id);

    let connnectionData = {
      socket: socket,
      db: Connection.db,
      users: users
      };

    // disconnected user
    let user = users.getBySocketId(socket.id);
    if (!user) return;

    // delete socketId from user
    user.socketId = "";
    console.log("user <%s> disconnected", user.id);

    // if user is finding match
    if (user.status === "wait") {

      // delete user from queue
      let keys = Object.keys(waitingQueues);

      for (let i = 0; i < keys.length; i++) {
        let index = waitingQueues[keys[i]].indexOf(user);
        if (index != -1) {
          waitingQueues[keys[i]].splice(index, 1);
        }
      }

      // change user status
      user.status = "ready";

    }

    let room = rooms.getById(user.playingRoomId);

    if (room) {

      room.broadcast("user disconnected", {
        userId: user.id,
        roomData: {
          id: room.id,
          players: room.connectedPlayers()
        }
      });

      room.deleteUser(user.id);

      if (room.players.length == 0) {

        QueryHandler.insertQuery(connnectionData, {
          table: "gamelog", 
          contents: {
            room_id: room.id,
            seed: room.seed
          }
        });
    
        console.log("Room <%s> deleted",room.id);
        rooms.roomList.splice(rooms.roomList.indexOf(room), 1);
        rooms.roomIdMap.delete(room.id);
      }

    }

    users.remove(user.id);

/*     user.setTimer(RECONNECT_TIMEOUT, () => {

      if (room) {

        room.broadcast("user disconnected", {
          userId: user.id,
          roomData: {
            id: room.id,
            players: room.connectedPlayers()
          }
        });

      }

      users.remove(user.id);

    }); */

  });

  // make path
  socket.on("make path", (data) => {

    /**
     * userId: userId,
     * path: path
     */

    // requested user
    let user = users.getById(data.userId);

    console.log("receive_");
    console.log({userId: data.userId, path: data.path});

    // check user status
    if (user.status != "play") return;

    let room = rooms.getById(user.playingRoomId);

    // send success massage
    room.broadcast("make path", {
      success: true,
      userId: user.id,
      path: data.path
    }, user.id);

    console.log("send_");
    console.log({userId: data.userId, path: data.path});

  });

});