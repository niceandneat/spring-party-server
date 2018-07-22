let mysql = require("mysql");

let queryHandler = require("./queryHandler");

function signUp(results, connnectionData) {

  // same id check
  for (let result of results) {
    if (result.user_id === connnectionData.data.id) {
      connnectionData.socket.emit("creat user", {
        success: false,
        error: "same id"
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

function signIn(results, connnectionData) {
  
  // id & password check
  for (let result of results) {
    if (result.user_id === connnectionData.data.id) {
      if (result.password === connnectionData.data.password) {

        // double sign in check
        if (connnectionData.users.exists(connnectionData.data.id)) {
          connnectionData.socket.emit("establish session", {
            success: false,
            error: "already signed"
          });
          return;
        }

        // register user in users(user list)
        connnectionData.users.register(
          connnectionData.data.id, "ready", connnectionData.socket.id);

        // update last_login in database
        queryHandler.updateQuery(connnectionData, {
          table: "user", 
          contents: {last_login: mysql.raw("NOW()")}, 
          condition: "id = " + result.id
        });

        // send sign in complete
        connnectionData.socket.emit("establish session", {
          success: true,
          userId: connnectionData.data.id
        });

        console.log("user <%s> connected", connnectionData.data.id);
        
        return;

      } else {

        connnectionData.socket.emit("establish session", {
          success: false,
          error: "wrong password"
        });
        return;
      }
    }
  }

  // if there is no matched id
  connnectionData.socket.emit("establish session", {
    success: false,
    error: "id unmatched"
  });

}

function sendUserData(result, connnectionData) {
  
  if (result) {
    connnectionData.socket.emit("fetch user", {
      success: true,
      userData: result[0]
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