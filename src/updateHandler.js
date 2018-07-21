let mysql = require("mysql");

let queryHandler = require("./queryHandler");
let session = require("./session");

function signUp(userList, connnectionData) {

  // same id check
  for (let user of userList) {
    if (user.user_id === connnectionData.data.id) {
      connnectionData.socket.emit("creat user", {
        error: "same id",
        success: false
      });
      return
    }
  }

  // insert new user at user related tables
  queryHandler.insertQuery(connnectionData, {
    table: "user", 
    contents: {
      user_id: connnectionData.data.id,
      password: connnectionData.data.password,
      first_login: mysql.raw("NOW()"),
      last_login: mysql.raw("NOW()")
      }
    });

  queryHandler.insertQuery(connnectionData, {
    table: "user_gamedata", 
    contents: {
      user_id: connnectionData.data.id
      }
    });

  queryHandler.insertQuery(connnectionData, {
    table: "user_gamestat", 
    contents: {
      user_id: connnectionData.data.id
      }
    });

  // sign up complete
  connnectionData.socket.emit("creat user", {
    success: true
  });

}

function signIn(userList, connnectionData) {
  
  // id & password check
  for (let user of userList) {
    if (user.user_id === connnectionData.data.id) {
      if (user.password === connnectionData.data.password) {

        // make session
        session.add(user.user_id);

        // update last_login in database
        queryHandler.updateQuery(connnectionData, {
          table: "user", 
          contents: {last_login: mysql.raw("NOW()")}, 
          condition: "id = " + user.id
        });

        // send sign in complete
        connnectionData.socket.emit("establish session", {
          success: true,
          userId: user.user_id,
          sessionId: session.getSession(user.user_id)
        });

        return;

      } else {
        connnectionData.socket.emit("establish session", {
          success: false,
          error: "wrong password"
        });
        return
      }
    }
  }

  // if there is no matched id
  connnectionData.socket.emit("establish session", {
    success: false,
    error: "id unmatched"
  });

}

function sendUserData(userData, connnectionData) {
  
  if (userData) {
    connnectionData.socket.emit("fetch user", {
      success: true,
      userData: userData[0]
    });
  } else {
    connnectionData.socket.emit("fetch user", {
      success: false,
      error: "no data"
    });
  }

}

exports.signIn = signIn;
exports.signUp = signUp;
exports.sendUserData = sendUserData;