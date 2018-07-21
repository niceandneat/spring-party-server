let app = require("http").createServer(onRequest);
let io = require("socket.io")(app);
let fs = require("fs");
let url = require("url");
let path = require("path");
let mysql = require("mysql");

let session = require("./session");
let RoomList = require("./RoomList").RoomList;
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

// user math find queue
let waitingQueues = {
  soloFour: [],
  soloTwo: [],
  teamFour: []
}


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
    if (session.hasSession(data.userSessionId)) {
      socket.emit("restore session", {
        success: true,
        userId: session.getId(data.userSessionId)
      });
    }
  });
  
  // sign up
  socket.on("creat user", (data) => {
    
    let connnectionData = {
      socket: socket,
      db: db,
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

    let connnectionData = {
      socket: socket,
      db: db,
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

    let connnectionData = {
      socket: socket,
      db: db,
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

    let connnectionData = {
      socket: socket,
      db: db,
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

    // check user status
    if (data.userStatus != "ready") return;

    console.log("request for finding match from <%s>", data.userId);

    // make user object
    let newUser = {
      userId: data.userId,
      socketId: socket.id
    };

    // distinguish user's target game
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
    currentQueue.push(newUser);
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

});