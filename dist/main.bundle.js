module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Connection.js":
/*!***************************!*\
  !*** ./src/Connection.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _http = __webpack_require__(/*! http */ \"http\");\n\nvar _http2 = _interopRequireDefault(_http);\n\nvar _socket = __webpack_require__(/*! socket.io */ \"socket.io\");\n\nvar _socket2 = _interopRequireDefault(_socket);\n\nvar _fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar _fs2 = _interopRequireDefault(_fs);\n\nvar _url = __webpack_require__(/*! url */ \"url\");\n\nvar _url2 = _interopRequireDefault(_url);\n\nvar _path = __webpack_require__(/*! path */ \"path\");\n\nvar _path2 = _interopRequireDefault(_path);\n\nvar _mysql = __webpack_require__(/*! mysql */ \"mysql\");\n\nvar _mysql2 = _interopRequireDefault(_mysql);\n\nvar _setting = __webpack_require__(/*! ./setting */ \"./src/setting.js\");\n\nvar _setting2 = _interopRequireDefault(_setting);\n\nvar _RoomList = __webpack_require__(/*! ./RoomList */ \"./src/RoomList.js\");\n\nvar _RoomList2 = _interopRequireDefault(_RoomList);\n\nvar _UserList = __webpack_require__(/*! ./UserList */ \"./src/UserList.js\");\n\nvar _UserList2 = _interopRequireDefault(_UserList);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Connection = function () {\n  function Connection() {\n    _classCallCheck(this, Connection);\n  }\n\n  // Setup\n\n\n  _createClass(Connection, [{\n    key: \"setup\",\n    value: function setup() {\n\n      this.app = _http2.default.createServer(this._onRequest);\n      this.io = (0, _socket2.default)(this.app);\n      this.db = _mysql2.default.createConnection(_setting2.default.db);\n\n      this.app.listen(3000);\n      this.db.connect();\n\n      // game room list\n      this.rooms = new _RoomList2.default();\n\n      // game user list\n      this.users = new _UserList2.default();\n    }\n\n    // url handler\n\n  }, {\n    key: \"_onRequest\",\n    value: function _onRequest(req, res) {\n\n      var pathname = _url2.default.parse(req.url).pathname;\n      var ext = _path2.default.parse(pathname).ext;\n\n      if (pathname == \"/\") {\n        pathname = \"/index.html\";\n      }\n\n      _fs2.default.readFile(pathname, function (err, data) {\n\n        if (err) {\n          console.log(err);\n          res.writeHead(404, { \"Content-Type\": \"text/html\" });\n          res.write(err.toString());\n        } else if (ext == \".css\") {\n          res.writeHead(200, { \"Content-Type\": \"text/css\" });\n          res.write(data);\n        } else if (ext == \".js\") {\n          res.writeHead(200, { \"Content-Type\": \"text/javascript\" });\n          res.write(data);\n        } else {\n          res.writeHead(200, { \"Content-Type\": \"text/html\" });\n          res.write(data);\n        }\n        res.end();\n      });\n    }\n  }]);\n\n  return Connection;\n}();\n\nexports.default = new Connection();\n\n//# sourceURL=webpack:///./src/Connection.js?");

/***/ }),

/***/ "./src/QueryHandler.js":
/*!*****************************!*\
  !*** ./src/QueryHandler.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar QuaryHandler = function () {\n  function QuaryHandler() {\n    _classCallCheck(this, QuaryHandler);\n  }\n\n  _createClass(QuaryHandler, null, [{\n    key: \"selectQuery\",\n    value: function selectQuery(connnectionData, queryData, callback) {\n\n      // make query statement\n      var queryText = \"SELECT * FROM \" + queryData.table;\n      if (queryData.condition) queryText += \" WHERE \" + queryData.condition;\n\n      // conduct query statement\n      connnectionData.db.query(queryText, function (error, results, fields) {\n        if (error) throw error;\n        if (typeof callback === \"function\") callback(results, connnectionData);\n      });\n    }\n  }, {\n    key: \"insertQuery\",\n    value: function insertQuery(connnectionData, queryData, callback) {\n\n      // make query statement\n      var queryText = \"INSERT INTO \" + queryData.table + \" SET ?\";\n\n      // conduct query statement\n      connnectionData.db.query(queryText, queryData.contents, function (error, results, fields) {\n        if (error) throw error;\n        if (typeof callback === \"function\") callback(results, connnectionData);\n      });\n    }\n  }, {\n    key: \"updateQuery\",\n    value: function updateQuery(connnectionData, queryData, callback) {\n\n      // make query statement\n      var queryText = \"UPDATE \" + queryData.table + \" SET ? WHERE \" + queryData.condition;\n\n      // conduct query statement\n      connnectionData.db.query(queryText, queryData.contents, function (error, results, fields) {\n        if (error) throw error;\n        if (typeof callback === \"function\") callback(results, connnectionData);\n      });\n    }\n  }]);\n\n  return QuaryHandler;\n}();\n\nexports.default = QuaryHandler;\n\n//# sourceURL=webpack:///./src/QueryHandler.js?");

/***/ }),

/***/ "./src/Room.js":
/*!*********************!*\
  !*** ./src/Room.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _crypto = __webpack_require__(/*! crypto */ \"crypto\");\n\nvar _crypto2 = _interopRequireDefault(_crypto);\n\nvar _Connection = __webpack_require__(/*! ./Connection */ \"./src/Connection.js\");\n\nvar _Connection2 = _interopRequireDefault(_Connection);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Room = function () {\n  function Room(id, counts, team) {\n    _classCallCheck(this, Room);\n\n    this.id = id;\n    this.playerCounts = counts;\n    this.isTeamGame = team;\n    this.seed = _crypto2.default.randomBytes(16).toString('hex');\n\n    this.players = [];\n    this.leftPlayers = [];\n\n    this.idList = [1, 2, 3, 4];\n  }\n\n  _createClass(Room, [{\n    key: \"_pickId\",\n    value: function _pickId() {\n      var idx = Math.floor(Math.random() * this.idList.length);\n      var id = this.idList[idx];\n      this.idList.splice(idx, 1);\n      return id;\n    }\n  }, {\n    key: \"_getColor\",\n    value: function _getColor(partyId) {\n      switch (partyId) {\n        case 1:\n          return 0x008744;\n        case 2:\n          return 0x0057e7;\n        case 3:\n          return 0xd62d20;\n        case 4:\n          return 0xffa700;\n      }\n    }\n  }, {\n    key: \"addPlayer\",\n    value: function addPlayer(player) {\n      this.players.push(player);\n      player.partyId = this._pickId();\n      player.territoryColor = this._getColor(player.partyId);\n      player.playingRoomId = this.id;\n    }\n  }, {\n    key: \"broadcast\",\n    value: function broadcast(event, data) {\n      var notMeId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;\n      var _iteratorNormalCompletion = true;\n      var _didIteratorError = false;\n      var _iteratorError = undefined;\n\n      try {\n\n        for (var _iterator = this.players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {\n          var player = _step.value;\n\n          if (player.socketId && player.id != notMeId) _Connection2.default.io.to(player.socketId).emit(event, data);\n        }\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (!_iteratorNormalCompletion && _iterator.return) {\n            _iterator.return();\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n    }\n  }, {\n    key: \"connectedPlayers\",\n    value: function connectedPlayers() {\n\n      var userList = [];\n\n      var _iteratorNormalCompletion2 = true;\n      var _didIteratorError2 = false;\n      var _iteratorError2 = undefined;\n\n      try {\n        for (var _iterator2 = this.players[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {\n          var player = _step2.value;\n\n          if (player.socketId) userList.push(player);\n        }\n      } catch (err) {\n        _didIteratorError2 = true;\n        _iteratorError2 = err;\n      } finally {\n        try {\n          if (!_iteratorNormalCompletion2 && _iterator2.return) {\n            _iterator2.return();\n          }\n        } finally {\n          if (_didIteratorError2) {\n            throw _iteratorError2;\n          }\n        }\n      }\n\n      return userList;\n    }\n  }, {\n    key: \"deleteUser\",\n    value: function deleteUser(userId) {\n      for (var i in this.players) {\n        if (this.players[i].id == userId) {\n          this.players.splice(i, 1);\n          this.leftPlayers.push(this.players[i]);\n          break;\n        }\n      }\n    }\n  }]);\n\n  return Room;\n}();\n\nexports.default = Room;\n\n//# sourceURL=webpack:///./src/Room.js?");

/***/ }),

/***/ "./src/RoomList.js":
/*!*************************!*\
  !*** ./src/RoomList.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _crypto = __webpack_require__(/*! crypto */ \"crypto\");\n\nvar _crypto2 = _interopRequireDefault(_crypto);\n\nvar _Room = __webpack_require__(/*! ./Room */ \"./src/Room.js\");\n\nvar _Room2 = _interopRequireDefault(_Room);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar RoomList = function () {\n  function RoomList() {\n    _classCallCheck(this, RoomList);\n\n    this.roomIdMap = new Map();\n    this.roomList = [];\n  }\n\n  _createClass(RoomList, [{\n    key: \"create\",\n    value: function create(counts, team, players) {\n      var room = new _Room2.default(this._generateUid(), counts, team, players);\n      this.roomIdMap.set(room.id, room);\n      this.roomList.push(room);\n      return room;\n    }\n  }, {\n    key: \"remove\",\n    value: function remove(roomId) {\n\n      var room = this.getById(roomId);\n      if (room) {\n        // room.close();\n        this.roomList.splice(this.roomList.indexOf(room), 1);\n        this.roomIdMap.delete(room.id);\n      }\n    }\n  }, {\n    key: \"exists\",\n    value: function exists(roomId) {\n      return this.roomIdMap.has(roomId);\n    }\n  }, {\n    key: \"getById\",\n    value: function getById(roomId) {\n      return this.roomIdMap.get(roomId);\n    }\n  }, {\n    key: \"update\",\n    value: function update(deltaTime) {\n      var _iteratorNormalCompletion = true;\n      var _didIteratorError = false;\n      var _iteratorError = undefined;\n\n      try {\n        for (var _iterator = this.roomList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {\n          var room = _step.value;\n\n          room.update(deltaTime);\n        }\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (!_iteratorNormalCompletion && _iterator.return) {\n            _iterator.return();\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n    }\n  }, {\n    key: \"_generateUid\",\n    value: function _generateUid() {\n      var uid = void 0;\n      do {\n        uid = _crypto2.default.createHash('sha256').update(Math.random().toString(36)).digest('hex').slice(0, 20);\n      } while (this.roomIdMap.has(uid));\n      return uid;\n    }\n  }]);\n\n  return RoomList;\n}();\n\nexports.default = RoomList;\n\n//# sourceURL=webpack:///./src/RoomList.js?");

/***/ }),

/***/ "./src/UpdateHandler.js":
/*!******************************!*\
  !*** ./src/UpdateHandler.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _mysql = __webpack_require__(/*! mysql */ \"mysql\");\n\nvar _mysql2 = _interopRequireDefault(_mysql);\n\nvar _QueryHandler = __webpack_require__(/*! ./QueryHandler */ \"./src/QueryHandler.js\");\n\nvar _QueryHandler2 = _interopRequireDefault(_QueryHandler);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar UpdateHandler = function () {\n  function UpdateHandler() {\n    _classCallCheck(this, UpdateHandler);\n  }\n\n  _createClass(UpdateHandler, null, [{\n    key: \"signUp\",\n    value: function signUp(results, connnectionData) {\n\n      // same id check\n      var _iteratorNormalCompletion = true;\n      var _didIteratorError = false;\n      var _iteratorError = undefined;\n\n      try {\n        for (var _iterator = results[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {\n          var result = _step.value;\n\n          if (result.user_id === connnectionData.data.id) {\n            connnectionData.socket.emit(\"creat user\", {\n              success: false,\n              error: \"same id\"\n            });\n            return;\n          }\n        }\n\n        // insert new user at user related tables\n      } catch (err) {\n        _didIteratorError = true;\n        _iteratorError = err;\n      } finally {\n        try {\n          if (!_iteratorNormalCompletion && _iterator.return) {\n            _iterator.return();\n          }\n        } finally {\n          if (_didIteratorError) {\n            throw _iteratorError;\n          }\n        }\n      }\n\n      _QueryHandler2.default.insertQuery(connnectionData, {\n        table: \"user\",\n        contents: {\n          user_id: connnectionData.data.id,\n          password: connnectionData.data.password,\n          first_login: _mysql2.default.raw(\"NOW()\"),\n          last_login: _mysql2.default.raw(\"NOW()\")\n        }\n      });\n\n      _QueryHandler2.default.insertQuery(connnectionData, {\n        table: \"user_gamedata\",\n        contents: {\n          user_id: connnectionData.data.id\n        }\n      });\n\n      _QueryHandler2.default.insertQuery(connnectionData, {\n        table: \"user_gamestat\",\n        contents: {\n          user_id: connnectionData.data.id\n        }\n      });\n\n      // sign up complete\n      connnectionData.socket.emit(\"creat user\", {\n        success: true\n      });\n    }\n  }, {\n    key: \"signIn\",\n    value: function signIn(results, connnectionData) {\n\n      // auto sign in check\n      if (connnectionData.data.isAuto) {\n\n        var len = results.length;\n\n        // enough accounts check\n        if (len === connnectionData.users.userList.length) {\n          connnectionData.socket.emit(\"establish session\", {\n            success: false,\n            error: \"not enough accounts\"\n          });\n          return;\n        }\n\n        var newUser = void 0;\n        do {\n          newUser = results[Math.min(Math.floor(len * Math.random()), len)];\n        } while (connnectionData.users.exists(newUser.user_id));\n\n        // register user in users(user list)\n        connnectionData.users.register(newUser.user_id, \"ready\", connnectionData.socket.id);\n\n        // update last_login in database\n        _QueryHandler2.default.updateQuery(connnectionData, {\n          table: \"user\",\n          contents: { last_login: _mysql2.default.raw(\"NOW()\") },\n          condition: \"id = \" + newUser.id\n        });\n\n        // send sign in complete\n        connnectionData.socket.emit(\"establish session\", {\n          success: true,\n          userId: newUser.user_id\n        });\n\n        console.log(\"user <%s> connected\", newUser.user_id);\n\n        return;\n      }\n\n      // id & password check\n      var _iteratorNormalCompletion2 = true;\n      var _didIteratorError2 = false;\n      var _iteratorError2 = undefined;\n\n      try {\n        for (var _iterator2 = results[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {\n          var result = _step2.value;\n\n          if (result.user_id === connnectionData.data.id) {\n            if (result.password === connnectionData.data.password) {\n\n              // double sign in check\n              if (connnectionData.users.exists(connnectionData.data.id)) {\n                connnectionData.socket.emit(\"establish session\", {\n                  success: false,\n                  error: \"already signed\"\n                });\n                return;\n              }\n\n              // register user in users(user list)\n              connnectionData.users.register(connnectionData.data.id, \"ready\", connnectionData.socket.id);\n\n              // update last_login in database\n              _QueryHandler2.default.updateQuery(connnectionData, {\n                table: \"user\",\n                contents: { last_login: _mysql2.default.raw(\"NOW()\") },\n                condition: \"id = \" + result.id\n              });\n\n              // send sign in complete\n              connnectionData.socket.emit(\"establish session\", {\n                success: true,\n                userId: connnectionData.data.id\n              });\n\n              console.log(\"user <%s> connected\", connnectionData.data.id);\n\n              return;\n            } else {\n\n              connnectionData.socket.emit(\"establish session\", {\n                success: false,\n                error: \"wrong password\"\n              });\n              return;\n            }\n          }\n        }\n\n        // if there is no matched id\n      } catch (err) {\n        _didIteratorError2 = true;\n        _iteratorError2 = err;\n      } finally {\n        try {\n          if (!_iteratorNormalCompletion2 && _iterator2.return) {\n            _iterator2.return();\n          }\n        } finally {\n          if (_didIteratorError2) {\n            throw _iteratorError2;\n          }\n        }\n      }\n\n      connnectionData.socket.emit(\"establish session\", {\n        success: false,\n        error: \"id unmatched\"\n      });\n    }\n  }, {\n    key: \"sendUserData\",\n    value: function sendUserData(result, connnectionData) {\n\n      if (result) {\n        connnectionData.socket.emit(\"fetch user\", {\n          success: true,\n          userData: result[0]\n        });\n      } else {\n        connnectionData.socket.emit(\"fetch user\", {\n          success: false,\n          error: \"no data\"\n        });\n      }\n    }\n  }]);\n\n  return UpdateHandler;\n}();\n\nexports.default = UpdateHandler;\n\n//# sourceURL=webpack:///./src/UpdateHandler.js?");

/***/ }),

/***/ "./src/User.js":
/*!*********************!*\
  !*** ./src/User.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar User = function () {\n  function User(id, status, socketId) {\n    _classCallCheck(this, User);\n\n    this.id = id;\n    this.status = status;\n    this.socketId = socketId;\n\n    this.partyCode = null;\n    this.partyId = null;\n    this.territoryColor = null;\n\n    this.timer = null;\n    this.playingRoomId = null;\n  }\n\n  _createClass(User, [{\n    key: \"setTimer\",\n    value: function setTimer(seconds, callback) {\n\n      this.unsetTimer();\n\n      this.timer = setTimeout(callback, seconds * 1000);\n    }\n  }, {\n    key: \"unsetTimer\",\n    value: function unsetTimer() {\n\n      if (this.timer) {\n        clearTimeout(this.timer);\n      }\n    }\n  }]);\n\n  return User;\n}();\n\nexports.default = User;\n\n\nexports.User = User;\n\n//# sourceURL=webpack:///./src/User.js?");

/***/ }),

/***/ "./src/UserList.js":
/*!*************************!*\
  !*** ./src/UserList.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _User = __webpack_require__(/*! ./User */ \"./src/User.js\");\n\nvar _User2 = _interopRequireDefault(_User);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar UserList = function () {\n  function UserList() {\n    _classCallCheck(this, UserList);\n\n    this.userIdMap = new Map();\n    this.userList = [];\n  }\n\n  _createClass(UserList, [{\n    key: \"register\",\n    value: function register(id, status, socketId) {\n      var user = new _User2.default(id, status, socketId);\n      this.userIdMap.set(user.id, user);\n      this.userList.push(user);\n      return user;\n    }\n  }, {\n    key: \"remove\",\n    value: function remove(userId) {\n      var user = this.getById(userId);\n      if (user) {\n        this.userList.splice(this.userList.indexOf(user), 1);\n        this.userIdMap.delete(user.id);\n      }\n    }\n  }, {\n    key: \"exists\",\n    value: function exists(userId) {\n      return this.userIdMap.has(userId);\n    }\n  }, {\n    key: \"getById\",\n    value: function getById(userId) {\n      return this.userIdMap.get(userId);\n    }\n  }, {\n    key: \"getBySocketId\",\n    value: function getBySocketId(socketId) {\n\n      for (var i = 0; i < this.userList.length; i++) {\n        if (this.userList[i].socketId == socketId) {\n          return this.userList[i];\n        }\n      }\n\n      return;\n    }\n  }]);\n\n  return UserList;\n}();\n\nexports.default = UserList;\n\n\nexports.UserList = UserList;\n\n//# sourceURL=webpack:///./src/UserList.js?");

/***/ }),

/***/ "./src/server.js":
/*!***********************!*\
  !*** ./src/server.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _mysql = __webpack_require__(/*! mysql */ \"mysql\");\n\nvar _mysql2 = _interopRequireDefault(_mysql);\n\nvar _Connection = __webpack_require__(/*! ./Connection */ \"./src/Connection.js\");\n\nvar _Connection2 = _interopRequireDefault(_Connection);\n\nvar _QueryHandler = __webpack_require__(/*! ./QueryHandler */ \"./src/QueryHandler.js\");\n\nvar _QueryHandler2 = _interopRequireDefault(_QueryHandler);\n\nvar _UpdateHandler = __webpack_require__(/*! ./UpdateHandler */ \"./src/UpdateHandler.js\");\n\nvar _UpdateHandler2 = _interopRequireDefault(_UpdateHandler);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n_Connection2.default.setup();\n\n// game room list\nvar rooms = _Connection2.default.rooms;\n\n// game user list\nvar users = _Connection2.default.users;\n\n// socket connection\nvar io = _Connection2.default.io;\n\n// user match find queue\nvar waitingQueues = {\n  soloTwo: [],\n  soloFour: [],\n  teamFour: []\n\n  // set timeout\n  // var RECONNECT_TIMEOUT = 5;\n\n};function conditionQueryString(column, value) {\n  return column + \" = \" + \"'\" + value + \"'\";\n}\n\nfunction shuffle(array) {\n  var currentIndex = array.length,\n      temporaryValue,\n      randomIndex;\n\n  while (currentIndex !== 0) {\n\n    randomIndex = Math.floor(Math.random() * currentIndex);\n    currentIndex -= 1;\n\n    temporaryValue = array[currentIndex];\n    array[currentIndex] = array[randomIndex];\n    array[randomIndex] = temporaryValue;\n  }\n\n  return array;\n}\n\nio.on(\"connection\", function (socket) {\n\n  // new socket\n  console.log(\"Connection to socket <%s> established\", socket.id);\n\n  // sign up\n  socket.on(\"creat user\", function (data) {\n\n    /**\n     * id : id input\n     * password : password input\n     */\n\n    var connnectionData = {\n      socket: socket,\n      db: _Connection2.default.db,\n      users: users,\n      data: data\n    };\n\n    var queryData = {\n      table: \"user\",\n      condition: null,\n      contents: null\n    };\n\n    _QueryHandler2.default.selectQuery(connnectionData, queryData, _UpdateHandler2.default.signUp);\n  });\n\n  // sign in\n  socket.on(\"establish session\", function (data) {\n\n    /**\n     * id : id input\n     * password : password input\n     * isAuto : auto sign in bool\n     */\n\n    var connnectionData = {\n      socket: socket,\n      db: _Connection2.default.db,\n      users: users,\n      data: data\n    };\n\n    var queryData = {\n      table: \"user\",\n      condition: null,\n      contents: null\n    };\n\n    _QueryHandler2.default.selectQuery(connnectionData, queryData, _UpdateHandler2.default.signIn);\n  });\n\n  // after sign in, send user's data\n  socket.on(\"fetch user\", function (data) {\n\n    /**\n     * userId : user who requested\n     */\n\n    var connnectionData = {\n      socket: socket,\n      db: _Connection2.default.db,\n      users: users,\n      data: data\n    };\n\n    var queryData = {\n      table: \"user_gamedata\",\n      condition: conditionQueryString(\"user_id\", data.userId),\n      contents: null\n    };\n\n    _QueryHandler2.default.selectQuery(connnectionData, queryData, _UpdateHandler2.default.sendUserData);\n  });\n\n  // update user data\n  socket.on(\"update user\", function (data) {\n\n    /**\n     * userId : user who requested\n     * contents : user data that need to be updated\n     */\n\n    // check user validation\n    if (users.getById(data.userId).socketId != socket.id) {\n      console.log(\"Unverified request from <%s>\", data.userId);\n      return;\n    }\n\n    var connnectionData = {\n      socket: socket,\n      db: _Connection2.default.db,\n      users: users,\n      data: data\n    };\n\n    var queryData = {\n      table: \"user_gamedata\",\n      condition: conditionQueryString(\"user_id\", data.userId),\n      contents: data.contents\n    };\n\n    _QueryHandler2.default.updateQuery(connnectionData, queryData);\n  });\n\n  // find match\n  socket.on(\"find match\", function (data) {\n\n    /**\n     * userId : user who requested\n     * partyCode : partyCode\n     * playerCounts : room player counts\n     * isTeam : weather team match bool\n     */\n\n    // requested user\n    var user = users.getById(data.userId);\n\n    // check user status\n    if (user.status != \"ready\") return;\n\n    console.log(\"request for finding match from <%s>\", data.userId);\n\n    // distinguish user's target game category\n    var currentQueue = void 0;\n    if (data.isTeam) {\n      currentQueue = waitingQueues.teamFour;\n    } else {\n      if (data.playerCounts === 4) {\n        currentQueue = waitingQueues.soloFour;\n      } else if (data.playerCounts === 2) {\n        currentQueue = waitingQueues.soloTwo;\n      }\n    }\n\n    // add to waiting queue\n    currentQueue.push(user);\n\n    // change user status\n    user.status = \"wait\";\n    user.partyCode = data.partyCode;\n\n    if (currentQueue.length === data.playerCounts) {\n\n      // make new room in room list\n      var room = rooms.create(data.playerCounts, data.isTeam);\n      console.log(\"<%s> room created for:\", room.id);\n\n      // push players in room's player list\n      var queueLength = currentQueue.length;\n\n      for (var i = 0; i < queueLength; i++) {\n        var player = currentQueue.shift();\n        room.addPlayer(player);\n        player.status = \"play\";\n        console.log(player.id);\n      }\n\n      // send success massage\n      room.broadcast(\"find match\", {\n        success: true,\n        roomData: {\n          id: room.id,\n          seed: room.seed,\n          players: room.connectedPlayers()\n        }\n      });\n    }\n  });\n\n  socket.on(\"cancel finding\", function (data) {\n\n    /**\n     * userId : user who requested\n     * playerCounts : room player counts\n     * isTeam : weather team match bool\n     */\n\n    // requested user\n    var user = users.getById(data.userId);\n\n    // check user status\n    if (user.status != \"wait\") return;\n\n    console.log(\"cancel request for finding match from <%s>\", data.userId);\n\n    // change user status\n    user.status = \"ready\";\n\n    // delete user from queue\n    var keys = Object.keys(waitingQueues);\n\n    for (var i = 0; i < keys.length; i++) {\n      var index = waitingQueues[keys[i]].indexOf(user(data.userId));\n      if (index != -1) {\n        waitingQueues[keys[i]].splice(index, 1);\n      }\n    }\n\n    // socket.emit(\"cancel finding\", {\n    //   success: true\n    // });\n  });\n\n  socket.on(\"end game\", function (data) {\n\n    /**\n     * userId: userId,\n     * userRank: userRank,\n     * rank: {userId, rank} list,\n     * stats: kills, relics, score, lives\n     */\n\n    // requested user\n    var user = users.getById(data.userId);\n\n    // check user status\n    if (user.status != \"play\") return;\n\n    console.log(\"end game request from <%s>\", data.userId);\n\n    var connnectionData = {\n      socket: socket,\n      db: _Connection2.default.db,\n      users: users,\n      data: data\n    };\n\n    var room = rooms.getById(user.playingRoomId);\n\n    room.deleteUser(user.id);\n\n    var rewards = [];\n    var totalCoin = 0;\n    var characterCode = Math.floor(Math.random() * 22);\n\n    rewards.push({\n      type: \"character\",\n      characterData: characterCode\n    });\n\n    for (var i = 0; i < 2; i++) {\n      var coinIncrement = Math.floor(Math.random() * 5) * 10 + 50;\n      rewards.push({ type: \"coin\", amount: coinIncrement });\n      totalCoin += coinIncrement;\n    };\n\n    rewards = shuffle(rewards);\n\n    var coinQueryString = \"`coin` + \" + totalCoin;\n    var cardQueryString = \"CONCAT(`card`, ',\" + characterCode + \"')\";\n\n    _QueryHandler2.default.updateQuery(connnectionData, {\n      table: \"user_gamedata\",\n      contents: {\n        coin: _mysql2.default.raw(coinQueryString),\n        card: _mysql2.default.raw(cardQueryString)\n      },\n      condition: conditionQueryString(\"user_id\", user.id)\n    });\n\n    _QueryHandler2.default.updateQuery(connnectionData, {\n      table: \"user_gamestat\",\n      contents: room.playerCounts == 4 ? {\n        total_games_played: _mysql2.default.raw(\"`total_games_played` + 1\"),\n        solo_four_games_played: _mysql2.default.raw(\"`solo_four_games_played` + 1\")\n      } : {\n        total_games_played: _mysql2.default.raw(\"`total_games_played` + 1\"),\n        solo_two_games_played: _mysql2.default.raw(\"`solo_four_games_played` + 1\")\n      },\n      condition: conditionQueryString(\"user_id\", user.id)\n    });\n\n    socket.emit(\"end game\", {\n      rewards: rewards\n    });\n\n    if (room.players.length == 0) {\n\n      _QueryHandler2.default.insertQuery(connnectionData, {\n        table: \"gamelog\",\n        contents: {\n          room_id: room.id,\n          rank: data.rank.join(),\n          seed: room.seed\n        }\n      });\n\n      console.log(\"Room <%s> deleted\", room.id);\n      rooms.roomList.splice(rooms.roomList.indexOf(room), 1);\n      rooms.roomIdMap.delete(room.id);\n    }\n\n    user.status = \"ready\";\n    user.playingRoomId = null;\n  });\n\n  socket.on(\"disconnect\", function () {\n\n    console.log(\"socket <%s> disconnected\", socket.id);\n\n    var connnectionData = {\n      socket: socket,\n      db: _Connection2.default.db,\n      users: users\n    };\n\n    // disconnected user\n    var user = users.getBySocketId(socket.id);\n    if (!user) return;\n\n    // delete socketId from user\n    user.socketId = \"\";\n    console.log(\"user <%s> disconnected\", user.id);\n\n    // if user is finding match\n    if (user.status === \"wait\") {\n\n      // delete user from queue\n      var keys = Object.keys(waitingQueues);\n\n      for (var i = 0; i < keys.length; i++) {\n        var index = waitingQueues[keys[i]].indexOf(user);\n        if (index != -1) {\n          waitingQueues[keys[i]].splice(index, 1);\n        }\n      }\n\n      // change user status\n      user.status = \"ready\";\n    }\n\n    var room = rooms.getById(user.playingRoomId);\n\n    if (room) {\n\n      room.broadcast(\"user disconnected\", {\n        userId: user.id,\n        roomData: {\n          id: room.id,\n          players: room.connectedPlayers()\n        }\n      });\n\n      room.deleteUser(user.id);\n\n      if (room.players.length == 0) {\n\n        _QueryHandler2.default.insertQuery(connnectionData, {\n          table: \"gamelog\",\n          contents: {\n            room_id: room.id,\n            seed: room.seed\n          }\n        });\n\n        console.log(\"Room <%s> deleted\", room.id);\n        rooms.roomList.splice(rooms.roomList.indexOf(room), 1);\n        rooms.roomIdMap.delete(room.id);\n      }\n    }\n\n    users.remove(user.id);\n\n    /*     user.setTimer(RECONNECT_TIMEOUT, () => {\n    \n          if (room) {\n    \n            room.broadcast(\"user disconnected\", {\n              userId: user.id,\n              roomData: {\n                id: room.id,\n                players: room.connectedPlayers()\n              }\n            });\n    \n          }\n    \n          users.remove(user.id);\n    \n        }); */\n  });\n\n  // make path\n  socket.on(\"make path\", function (data) {\n\n    /**\n     * userId: userId,\n     * path: path\n     */\n\n    // requested user\n    var user = users.getById(data.userId);\n\n    console.log(\"receive_\");\n    console.log({ userId: data.userId, path: data.path });\n\n    // check user status\n    if (user.status != \"play\") return;\n\n    var room = rooms.getById(user.playingRoomId);\n\n    // send success massage\n    room.broadcast(\"make path\", {\n      success: true,\n      userId: user.id,\n      path: data.path\n    }, user.id);\n\n    console.log(\"send_\");\n    console.log({ userId: data.userId, path: data.path });\n  });\n});\n\n//# sourceURL=webpack:///./src/server.js?");

/***/ }),

/***/ "./src/setting.js":
/*!************************!*\
  !*** ./src/setting.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nvar settings = {\n  db: {\n    host: \"13.209.96.210\",\n    user: \"root\",\n    password: \"qwe123\",\n    database: \"spring-party\"\n  }\n};\n\nexports.default = settings;\n\n//# sourceURL=webpack:///./src/setting.js?");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"crypto\");\n\n//# sourceURL=webpack:///external_%22crypto%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "mysql":
/*!************************!*\
  !*** external "mysql" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mysql\");\n\n//# sourceURL=webpack:///external_%22mysql%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"socket.io\");\n\n//# sourceURL=webpack:///external_%22socket.io%22?");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"url\");\n\n//# sourceURL=webpack:///external_%22url%22?");

/***/ })

/******/ });