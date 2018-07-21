let hash = require("hash.js");

let sessionMap = new Map();

function add(id) {
  sessionMap.set(hash.sha256().update(id).digest("hex"), id);
}

function hasSession(session) {
  sessionMap.has(session);
}

function hasId(id) {
  for (let value of sessionMap.values()) {
    if (value === id) {
      return true;
    }
  }
  return false;
}

function getId(session) {
  sessionMap.get(session);
}

function getSession(id) {
  for (let [key, value] of sessionMap) {
    if (value === id) {
      return key;
    }
  }
}

function deleteSession(session) {
  for (let key of sessionMap.keys()) {
    if (key === session) {
      sessionMap.delete(key);
      return;
    }
  }
}

function deleteId(id) {
  for (let [key, value] of sessionMap) {
    if (value === id) {
      sessionMap.delete(key);
      return;
    }
  }
}

exports.sessionMap = sessionMap;
exports.add = add;
exports.hasSession = hasSession;
exports.hasId = hasId;
exports.getId = getId;
exports.getSession = getSession;
exports.deleteSession = deleteSession;
exports.deleteId = deleteId;