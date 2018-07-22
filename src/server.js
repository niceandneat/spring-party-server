let app = require("http").createServer(onRequest);
let io = require("socket.io")(app);
let fs = require("fs");
let url = require("url");
let path = require("path");
let mysql = require("mysql");

let RoomList = require("./RoomList").RoomList;
let UserList = require("./UserList").UserList;
let queryHandler = require("./queryHandler");
let updateHandler = require("./updateHandler");

let db = mysql.createConnection({
  host     : "localhost",
  user     : "root",
  password : "ehdrjs0309",
  database : "spring_party"
});

app.listen(8080);
db.connect();

// game room list
let rooms = new RoomList();

// game user list
let users = new UserList();

// user math find queue
let waitingQueues = {
  soloFour: [],
  soloTwo: [],
  teamFour: []
}

// url handler
function onRequest(req, res) {

  let pathname = url.parse(req.url).pathname;
  let ext = path.parse(pathname).ext;

  if (pathname == "/") {
    pathname = "/test.html";
  }

  fs.readFile("../test" + pathname, function (err, data) {

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

    if (users.exists(data.userId)) {

      socket.emit("restore session", {
        success: true,
        userId: users.getById(data.userId)
      });

    }

    socket.emit("restore session", {
      success: false,
      error: "connection expired"
    });

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
    console.log(waitingQueues);

    if (currentQueue.length === data.playerCounts) {
      
      // make new room in room list
      let room = rooms.create(data.playerCounts, data.isTeam);
      console.log("<%s> room created for:", room.id);

      // push players in room's player list
      let queueLength = currentQueue.length
      for (let i = 0; i < queueLength; i++) {
        let player = currentQueue.shift();
        room.players.push(player);
        console.log(player.userId);
      }

      // send success massage
      room.broadcast(io, "find match", {
        success: true,
        roomData: {
          id: room.id,
          players: room.players
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

    console.log("Connection to socket <%s> disconnected", socket.id);



  });

});