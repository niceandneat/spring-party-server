import crypto from "crypto";

import Party from "./cli-core/Party.js";
import Stage from "./cli-core/Stage.js";
import StageData from "./cli-core/StageData.js";
import Character from "./cli-core/Character.js";
import CharacterData from "./cli-core/CharacterData.js";
import Configuration from "./cli-core/Configuration.js";
import PartySimulator from "./cli-core/PartySimulator.js";

export default class Room {

  constructor(id, counts, team, players) {
    this.id = id;
    this.playerCounts = counts;
    this.isTeamGame = team;
    this.seed = crypto.randomBytes(16*16*2).toString('hex');

    this.players = players;
    this.aiPlayers = [];

    this._initialize();
  }

  _initialize() {
    // Create a stage
    this.stageData = new StageData(this.seed);
    this.stage = new Stage(this.stageData);

    // Create ai players list
    for (let i = 0; i < this.playerCounts - this.players.length; i++) {
      this.aiPlayers.push(0);
    }

    let idList = [1, 2, 3, 4];
    // let colorList = [0x008744, 0x0057e7, 0xd62d20, 0xffa700];

    // Create player parties
    for (let player of this.players) {

      let partyId = this._pickId(idList);
      let party = new Party(player.id, partyId, this._getColor(partyId));

      for (let i = 0; i < 3; i++) {
        let characterData = new CharacterData()
        let character = new Character(characterData);
        party.addMember(character);
      }

      this.stage.addParty(party);

    }

    // Create ai parties
    for (let aiPlayer of this.aiPlayers) {

      let partyId = this._pickId(idList);
      let party = new Party(aiPlayer.id, partyId, this._getColor(partyId));
      let ai = new PartySimulator(party);

      ai.setEnvironment(this.stage.territory, this.stage.meta.obstacles);
      ai.onAction((direction, coord, tgt) => {
        party.scheduleDirection(direction);
      });

      for (let i = 0; i < 3; i++) {
        let characterData = new CharacterData()
        let character = new Character(characterData);
        party.addMember(character);
      }

      this.stage.addParty(party);

    }

    // add parties to stage
    for (let party of this.stage.parties) {
      let startCoordinate = this._getStartCoordinate(party.id);
      party.setStartCoordinate(startCoordinate.x, startCoordinate.y, (party.id + 1) % 4);
      party.displaceToStartCoordinate();
    }

  }

  _pickId(idList) {
    let idx = Math.floor(Math.random() * idList.length);
    let id = idList[idx];
    idList.splice(idx, 1);
    return id;
  }

  _getColor(partyId) {
    switch(partyId) {
      case 1:
        return 0x008744;
      case 2:
        return 0x0057e7;
      case 3:
        return 0xd62d20;
      case 4:
        return 0xffa700;
    }
  }

  _getStartCoordinate(partyId) {
    switch(partyId) {
      case 1:
        return { x: this.stage.meta.dimension.width - 1, y: 0 };
      case 2:
        return { x: 0, y: 0 };
      case 3:
        return { x: 0, y: this.stage.meta.dimension.height - 1 };
      case 4:
        return { 
          x: this.stage.meta.dimension.width - 1, 
          y: this.stage.meta.dimension.height - 1 
        };
    }
  }

  update(deltaTime) {
    for (let i = 0; i < this.aiPlayers.length; i++) {
      this.aiPlayers[i].update(deltaTime);
    }

    this.stage.update(deltaTime);
  }

  broadcast(io, event, data) {

    for (let player of this.players) {
      if (player.socketId) io.to(player.socketId).emit(event, data);
    }
  
  }

  connectedPlayers() {

    let userList = [];

    for (let player of this.players) {
      if (player.socketId) userList.push(player);
    }

    return userList;

  }

}