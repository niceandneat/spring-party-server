import http from "http";
import socketIo from "socket.io";
import fs from "fs";
import url from "url";
import path from "path";
import mysql from "mysql";

import setting from "./setting"
import RoomList from "./RoomList";
import UserList from "./UserList";

class Connection {

  constructor() {

  }

  // Setup
  setup() {

    this.app = http.createServer(this._onRequest);
    this.io = socketIo(this.app);
    this.db = mysql.createConnection(setting.db);

    this.app.listen(3000);
    this.db.connect();

    // game room list
    this.rooms = new RoomList();

    // game user list
    this.users = new UserList();

  }

  // url handler
  _onRequest(req, res) {

    let pathname = url.parse(req.url).pathname;
    let ext = path.parse(pathname).ext;

    if (pathname == "/") {
      pathname = "/index.html";
    }

    fs.readFile(pathname, function (err, data) {

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

}

export default new Connection();