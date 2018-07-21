let socket = io('http://localhost:8080');

// html elements
let signInContainer = document.getElementById("signInContainer");
let idInput = document.getElementById("id");
let passwordInput = document.getElementById("password");
let status = document.getElementById("status");
let userContainer = document.getElementById("userContainer");
let matchButton = document.getElementById("matchButton");
let matchInfoContainer = document.getElementById("matchInfoContainer");

// user id in database
let userInfo = {};

status.innerHTML = "서버 접속됨";

// session check
if (sessionStorage.sessionId) {
  socket.emit("restore session", {
    userSessionId: sessionStorage.sessionId
  });
}

// sign up response
socket.on("creat user", (data) => {

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

  if (data.success) {

    // make new session
    sessionStorage.sessionId = data.sessionId;

    status.innerHTML = idInput.value + " 로그인 완료";
    idInput.value = "";
    passwordInput.value = "";

    // make userInfo based on data
    userInfo = {
      userId: data.userId,
      userSessionId: data.sessionId,
      userStatus: "ready"
    };

    fetchUser();

  } else if (data.error === "wrong password") {
    status.innerHTML = "패스워드 잘못침";
    passwordInput.value = "";
  } else if (data.error === "id unmatched") {
    status.innerHTML = "아이디 없음";
    idInput.value = "";
    passwordInput.value = "";
  }

});

// load database response
socket.on("fetch user", (data) => {

  if (data.success) {

    let keys = Object.keys(data.userData);

    for (let i = 1; i < keys.length; i++) {
      let para = document.createElement("p");
      let docu = document.createTextNode(keys[i] + " : " + data.userData[keys[i]]);
      para.appendChild(docu);
      userContainer.appendChild(para);
    }

  }

});

// find match reponse
socket.on("find match", (data) => {

  if (data.success) {
    matchInfoContainer.innerHTML = "";

    let keys = Object.keys(data.roomData);
    console.log(data.roomData);

    for (let i = 0; i < keys.length; i++) {
      let para = document.createElement("p");
      let docu = document.createTextNode(keys[i] + " : " + data.roomData[keys[i]]);
      para.appendChild(docu);
      matchInfoContainer.appendChild(para);
    }
  }

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
    password: passwordContent
  });
}

// sign in request
function establishSession() {

  let idContent = idInput.value;
  let passwordContent = passwordInput.value;

  socket.emit("establish session", {
    id: idContent,
    password: passwordContent
  });
}

// load database request
function fetchUser() {
  
  socket.emit("fetch user", {
    userId: userInfo.userId
  });

  signInContainer.style.display = "none";
  userContainer.style.display = "block";

}

// match find request
function findMatch(counts, team) {

  socket.emit("find match", {
    userId: userInfo.userId,
    userStatus: userInfo.userStatus,
    playerCounts: counts,
    isTeam: team
  });

  // change user status to 'wait'
  userInfo.userStatus = "wait";

  userContainer.style.display = "none";
  matchInfoContainer.style.display = "block";

  let para = document.createElement("p");
  let docu = document.createTextNode("매치 찾는중...");
  para.appendChild(docu);
  matchInfoContainer.appendChild(para);

}

/*

// just in case

// update database request
function updateUser() {

  let update = {};

  for (let i = 0; i < arguments.length; i = i + 2) {
    update[arguments[i]] = arguments[i+1];
  }

  socket.emit("update user", {
    userId: userInfo.userId,
    contents: update
  });
}

// increment level (test function)
function levelUp() {
  updateUser("level", 5);
}

*/