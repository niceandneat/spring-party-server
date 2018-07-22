let socket = io('http://localhost:8080');

// html elements
let signInContainer = document.getElementById("signInContainer");
let idInput = document.getElementById("id");
let passwordInput = document.getElementById("password");
let status = document.getElementById("status");
let userContainer = document.getElementById("userContainer");
let userStatusContainer = document.getElementById("userStatusContainer");
let matchContainer = document.getElementById("matchContainer");
let matchStatusContainer = document.getElementById("matchStatusContainer");
let matchCancelButton = document.getElementById("matchCancelButton");

// object to save current user info
let userInfo = { status: "idle" };

// connection check
socket ? status.innerHTML = "서버연결됨" : status.innerHTML = "서버닫힘";

// session check
if (sessionStorage.userId) {
  console.log("restore request " + userInfo.status);
  socket.emit("restore session", {
    userId: sessionStorage.userId,
    userStatus: userInfo.status
  });
}

// session restore response
socket.on("restore session", (data) => {

  /**
   * success : bool
   * error : error content
   * userId : user id
   * userStatus : user status
   * roomData : {id, players}
   */

  if (data.success) {

    userInfo = {
      id: data.userId,
      status: data.userStatus
    };

    if (userInfo.status === "ready") {
      fetchUser();
    } else if (userInfo.status === "play" && data.roomData) {
      createDataHTML({ roomId: data.roomData.id }, matchStatusContainer);
      createDataHTML(data.roomData.players, matchStatusContainer, false);
  
      signInContainer.style.display = "none";
      userContainer.style.display = "none";
      matchContainer.style.display = "block";
      matchCancelButton.style.display = "none";
    }

  }

  console.log(data.error);

});

// sign up response
socket.on("creat user", (data) => {

  /**
   * success : bool
   * error : error content
   */

  if (data.success) {
    status.innerHTML = "ID: " + idInput.value + " 가입 완료";
    idInput.value = "";
    passwordInput.value = "";
  } else if (data.error === "same id") {
    status.innerHTML = "ID: " + idInput.value + " 는 이미 가입된 아이디";
    idInput.value = "";
    passwordInput.value = "";
  }

});

// sign in response
socket.on("establish session", (data) => {

  /**
   * success : bool
   * error : error content
   * userId : user id who requested
   */

  if (data.success) {

    // make new session
    sessionStorage.userId = data.userId;

    status.innerHTML = idInput.value + " 로그인 완료";
    idInput.value = "";
    passwordInput.value = "";

    // make userInfo based on data
    userInfo = {
      id: data.userId,
      status: "ready"
    };

    fetchUser();

  } else if (data.error === "wrong password") {
    status.innerHTML = "패스워드 잘못침";
    passwordInput.value = "";
  } else if (data.error === "id unmatched") {
    status.innerHTML = "아이디 없음";
    idInput.value = "";
    passwordInput.value = "";
  } else if (data.error === "already signed") {
    status.innerHTML = "이미 접속중";
    idInput.value = "";
    passwordInput.value = "";
  }

});

// load database response
socket.on("fetch user", (data) => {

  /**
   * success : bool
   * error : error content
   * userData : requested user data
   */

  if (data.success) {

    createDataHTML(data.userData, userStatusContainer);

    signInContainer.style.display = "none";
    userContainer.style.display = "block";
    matchContainer.style.display = "none";

  }

});

// find match reponse
socket.on("find match", (data) => {

  /**
   * success : bool
   * roomData : {id, players}
   */


  if (data.success) {

    // change user status
    userInfo.status = "play"

    createDataHTML({roomId: data.roomData.id}, matchStatusContainer);
    createDataHTML(data.roomData.players, matchStatusContainer, false);

    matchCancelButton.style.display = "none"

  }

});

// cancel find match reponse
socket.on("cancel finding", (data) => {

  /**
   * success : bool
   */

  // change user status
  userInfo.status = "ready"

  fetchUser();

});

// user disconnection reponse
socket.on("user disconnected", (data) => {

  /**
   * userId : disconnected user id
   * roomData : {id, players}
   */

  createDataHTML({roomId: data.roomData.id}, matchStatusContainer);
  createDataHTML(data.roomData.players, matchStatusContainer, false);

});

// sign up request
function creatUser() {

  let idContent = idInput.value;
  let passwordContent = passwordInput.value;

  if (!idContent) {
    idInput.style.borderColor = "tomato";
    return
  } else if (!passwordContent) {
    passwordInput.style.borderColor = "tomato";
    return
  }
  socket.emit("creat user", {
    id: idContent,
    password: passwordContent,
    userStatus: userInfo.status
  });
}

// sign in request
function establishSession() {

  let idContent = idInput.value;
  let passwordContent = passwordInput.value;

  if (!idContent) {
    idInput.style.borderColor = "tomato";
    return
  } else if (!passwordContent) {
    passwordInput.style.borderColor = "tomato";
    return
  }

  socket.emit("establish session", {
    id: idContent,
    password: passwordContent,
    userStatus: userInfo.status
  });

}

// load database request
function fetchUser() {
  
  socket.emit("fetch user", {
    userId: userInfo.id,
    userStatus: userInfo.status
  });

}

// update database request
function updateUser() {

  let update = {};

  for (let i = 0; i < arguments.length; i = i + 2) {
    update[arguments[i]] = arguments[i+1];
  }

  socket.emit("update user", {
    userId: userInfo.id,
    userStatus: userInfo.status,
    contents: update
  });
  
}

// match find request
function findMatch(counts, team) {

  socket.emit("find match", {
    userId: userInfo.id,
    userStatus: userInfo.status,
    playerCounts: counts,
    isTeam: team
  });

  // change user status to 'wait'
  userInfo.status = "wait";

  // change UI
  matchStatusContainer.innerHTML = "";

  let para = document.createElement("p");
  let docu = document.createTextNode("매치 찾는중...");
  para.appendChild(docu);
  matchStatusContainer.appendChild(para);

  signInContainer.style.display = "none";
  userContainer.style.display = "none";
  matchContainer.style.display = "block";
  matchCancelButton.style.display = "inline";

}

// cancel finding request
function cancelFindingMatch() {

  socket.emit("cancel finding", {
    userId: userInfo.id,
    userStatus: userInfo.status
  });

}

// display data
function createDataHTML(data, parentElement, clear = true) {

  if (clear) parentElement.innerHTML = "";

  let keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    let para = document.createElement("p");
    let content = typeof data[keys[i]] == "object" && 
      data[keys[i]] != null ?
      data[keys[i]].id : data[keys[i]];
    let docu = document.createTextNode(keys[i] + " : " + content);
    para.appendChild(docu);
    parentElement.appendChild(para);
  }

}

// for debug
function viewServerStatus() {
  console.log("debug");
  socket.emit("view server status");
}

/**

// just in case

// increment level (test function)
function levelUp() {
  updateUser("level", 5);
}

*/