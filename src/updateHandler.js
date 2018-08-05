import mysql from "mysql";

import QueryHandler from "./QueryHandler";

export default class UpdateHandler {
  static signUp(results, connnectionData) {

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
    QueryHandler.insertQuery(connnectionData, {
      table: "user", 
      contents: {
        user_id: connnectionData.data.id,
        password: connnectionData.data.password,
        first_login: mysql.raw("NOW()"),
        last_login: mysql.raw("NOW()")
        }
      });
  
    QueryHandler.insertQuery(connnectionData, {
      table: "user_gamedata", 
      contents: {
        user_id: connnectionData.data.id
        }
      });
  
      QueryHandler.insertQuery(connnectionData, {
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
  
  static signIn(results, connnectionData) {
  
    // auto sign in check
    if (connnectionData.data.isAuto) {
  
      let len = results.length;
  
      // enough accounts check
      if (len === connnectionData.users.userList.length) {
        connnectionData.socket.emit("establish session", {
          success: false,
          error: "not enough accounts"
        });
        return;
      }
  
      let newUser;
      do {
        newUser = results[Math.min(Math.floor(len * Math.random()), len)];
      } while (connnectionData.users.exists(newUser.user_id));
      
      // register user in users(user list)
      connnectionData.users.register(
        newUser.user_id, "ready", connnectionData.socket.id);
  
      // update last_login in database
      QueryHandler.updateQuery(connnectionData, {
        table: "user", 
        contents: {last_login: mysql.raw("NOW()")}, 
        condition: "id = " + newUser.id
      });
  
      // send sign in complete
      connnectionData.socket.emit("establish session", {
        success: true,
        userId: newUser.user_id
      });
  
      console.log("user <%s> connected", newUser.user_id);
      
      return;
  
    }
    
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
          QueryHandler.updateQuery(connnectionData, {
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
  
  static sendUserData(result, connnectionData) {
    
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
  
}