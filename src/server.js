let app = require("http").createServer(onRequest);
let io = require("socket.io")(app);
let fs = require("fs");
let url = require("url");
let path = require("path");
let mysql = require("mysql");

let setting = require("./setting")
let RoomList = require("./RoomList").RoomList;
let UserList = require("./UserList").UserList;
let queryHandler = require("./queryHandler");
let updateHandler = require("./updateHandler");

let db = mysql.createConnection(setting.db);

app.listen(8080);
db.connect();

// game room list
let rooms = new RoomList();

// game user list
let users = new UserList();

// user math find queue
let waitingQueues = {
  soloTwo: [],
  soloFour: [],
  teamFour: []
}

// set timeout
var RECONNECT_TIMEOUT = 5;

// url handler
function onRequest(req, res) {

  let pathname = url.parse(req.url).pathname;
  let ext = path.parse(pathname).ext;

  if (pathname == "/") {
    pathname = "/test.html";
  }

  fs.readFile("./test" + pathname, function (err, data) {

    if (err) {
      console.log(err);
      res.writeHead(404, {"Content-Type": "text/html"});
      res.write(err.toString());
    } else if (ext == ".css") {
      res.writeHead(200, {"Content-Type": "text/css"});
      res.write(data);
    } else if (ext == ".js") {
      res.writeHead(200, {"Content-Type": "text/javascript"});
      res.write(data);
    } else {
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(data);
    }
    res.end();
    
  });

}

io.on("connection", function (socket) {

  // new socket
  console.log("Connection to socket <%s> established", socket.id);

  // session check
  socket.on("restore session", (data) => {

    if (data.userStatus != "idle") return;

    if (users.exists(data.userId)) {

      // find user with client session user id
      let user = users.getById(data.userId);

      // conduct user restore process
      user.unsetTimer();
      user.socketId = socket.id;

      let userData = {
        success: true,
        userId: user.id,
        userStatus: user.status
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

  });
  
  // sign up
  socket.on("creat user", (data) => {

    /**
     * id : id input
     * password : password input
     * userStatus : current user status
     */

    // check user status
    if (data.userStatus != "idle") return;
    
    let connnectionData = {
      socket: socket,
      db: db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user",
      condition: null,
      contents: null
    }

    queryHandler.selectQuery(connnectionData, queryData, updateHandler.signUp);

  });

  // sign in
  socket.on("establish session", (data) => {

    /**
     * id : id input
     * password : password input
     * userStatus : current user status
     */

    // check user status
    if (data.userStatus != "idle") return;

    let connnectionData = {
      socket: socket,
      db: db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user",
      condition: null,
      contents: null
    }

    queryHandler.selectQuery(connnectionData, queryData, updateHandler.signIn);

  });

  // after sign in, send user's data
  socket.on("fetch user", (data) => {

    /**
     * userId : user who requested
     * userStatus : current user status
     */

    // check user status
    if (data.userStatus === "idle") return;

    let connnectionData = {
      socket: socket,
      db: db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user_gamedata",
      condition: "user_id = " + "'" + data.userId + "'",
      contents: null
    }

    queryHandler.selectQuery(connnectionData, queryData, updateHandler.sendUserData);

  });

  // update user data
  socket.on("update user", (data) => {

    /**
     * userId : user who requested
     * userStatus : current user status
     * contents : user data that need to be updated
     */

    // check user status
    if (data.userStatus === "idle") return;

    let connnectionData = {
      socket: socket,
      db: db,
      users: users,
      data: data
    };

    let queryData = {
      table: "user_gamedata",
      condition: "user_id = " + "'" + data.userId + "'",
      contents: data.contents
    }

    queryHandler.updateQuery(connnectionData, queryData);

  });

  // find match
  socket.on("find match", (data) => {

    /**
     * userId : user who requested
     * userStatus : current user status
     * playerCounts : room player counts
     * isTeam : weather team match bool
     */

    // check user status
    if (data.userStatus != "ready") return;

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
    currentQueue.push(users.getById(data.userId));

    // change user status
    users.getById(data.userId).status = "wait";

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
      room.broadcast(io, "find match", {
        success: true,
        roomData: {
          id: room.id,
          players: room.connectedPlayers()
        }
      });

    }

  });

  socket.on("cancel finding", (data) => {

    /**
     * userId : user who requested
     * userStatus : current user status
     * playerCounts : room player counts
     * isTeam : weather team match bool
     */

    // check user status
    if (data.userStatus != "wait") return;

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

    user.setTimer(RECONNECT_TIMEOUT, () => {

      if (room) {

        room.broadcast(io, "user disconnected", {
          userId: user.id,
          roomData: {
            id: room.id,
            players: room.connectedPlayers()
          }
        });

      }

      users.remove(user.id);

    });

  });

  // for Debug
  socket.on("view server status", () => {
    console.log("\nusers          ******************************");
    console.log(users);
    console.log("\nrooms          ******************************");
    console.log(rooms);
    console.log("\nwaitingQueues  ******************************");
    console.log(waitingQueues);
  });

});