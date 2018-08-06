import Connection from "./Connection"
import Ticker from "./cli-core/Ticker"
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

// Timer for real-time update
let ticker = new Ticker();
ticker.start();
ticker.add(() => {
  update();
});

// update function
function update() {
  rooms.update(ticker.deltaTime);
}

io.on("connection", function (socket) {

  // new socket
  console.log("Connection to socket <%s> established", socket.id);

/*   // session check
  socket.on("restore session", (data) => {

    if (users.exists(data.userId)) {

      // find user with client session user id
      let user = users.getById(data.userId);

      // conduct user restore process
      user.unsetTimer();
      user.socketId = socket.id;

      let userData = {
        success: true,
        userId: user.id
      };

      let room = rooms.getById(user.playingRoomId);
      if (room) userData.roomData = {id: room.id, players: room.connectedPlayers()};

      socket.emit("restore session", userData);

      console.log("user <%s> restored", user.id);

    } else {

      socket.emit("restore session", {
        success: false,
        error: "connection expired"
      });

    }

  }); */
  
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
      condition: "user_id = " + "'" + data.userId + "'",
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
      condition: "user_id = " + "'" + data.userId + "'",
      contents: data.contents
    };

    QueryHandler.updateQuery(connnectionData, queryData);

  });

  // find match
  socket.on("find match", (data) => {

    /**
     * userId : user who requested
     * playerCounts : room player counts
     * isTeam : weather team match bool
     */

    let user = users.getById(data.userId);

    // check user status
    if (user.status != "ready") return;

    console.log("request for finding match from <%s>", data.userId);

    // make new room in room list
    let room = rooms.create(data.playerCounts, data.isTeam, [user]);
    console.log("<%s> room created for: <%s>", room.id, user.id);

    // enroll user in the room
    user.playingRoomId = room.id;
    user.status = "play";

    // send success massage
    let partyList = [];
    for (let party of room.stage.parties) {
      partyList.push({
        id : party.id,
        userId : party.userId,
        territoryColor : party.territoryColor,
        deckCode : party.deckCode,
        isAi : party.false
      });
    }

    room.broadcast("find match", {
      success: true,
      roomData: {
        id: room.id,
        seed: room.seed,
        players: room.players,
        parties: partyList
      }
    });

/* 
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

    if (currentQueue.length === data.playerCounts) {
      
      // make new room in room list
      let room = rooms.create(data.playerCounts, data.isTeam);
      console.log("<%s> room created for:", room.id);

      // push players in room's player list
      let queueLength = currentQueue.length;

      for (let i = 0; i < queueLength; i++) {
        let player = currentQueue.shift();
        room.players.push(player);
        player.playingRoomId = room.id;
        player.status = "play";
        console.log(player.id);
      }

      // send success massage
      room.broadcast("find match", {
        success: true,
        roomData: {
          id: room.id,
          players: room.connectedPlayers()
        }
      });

    } */

  });

  socket.on("cancel finding", (data) => {

    /**
     * userId : user who requested
     * playerCounts : room player counts
     * isTeam : weather team match bool
     */

    // check user status
    if (users.getById(data.userId).status != "wait") return;

    console.log("cancel request for finding match from <%s>", data.userId);

    // change user status
    users.getById(data.userId).status = "ready";

    // delete user from queue
    let keys = Object.keys(waitingQueues);

    for (let i = 0; i < keys.length; i++) {
      let index = waitingQueues[keys[i]].indexOf(users.getById(data.userId));
      if (index != -1) {
        waitingQueues[keys[i]].splice(index, 1);
      }
    }

    socket.emit("cancel finding", {
      success: true
    });
    
  });

  socket.on("disconnect", () => {

    console.log("socket <%s> disconnected", socket.id);

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

  // change direction

  socket.on("change direction", (data) => {

    /**
     * roomId: roomId
     * pratyId: partyId
     * direction: direction
     * coordinate: coordinate
     */

   for (let party of rooms.getById(data.roomId).stage.parties) {
      if (party.id == data.pratyId) {
        party.scheduleDirection(data.direction, data.coordinate);
      }
    }
     
    
  });

});