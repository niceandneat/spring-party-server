import CharacterData from "./CharacterData.js";

var CharacterDatabase = [
  new CharacterData({
    index: 0,
    name: "팽팽",
    description: "적 영역에서 속도 +30%",
    rarity: 0,
    maxHealth: 30,
    speed: 4,
    bodyTexture: {
      front: "unit-front-no1",
      back: "unit-back-no1"
    }
  }),
  new CharacterData({
    index: 1,
    name: "용용",
    description: "하늘을 날지 못하는 용이다.",
    rarity: 3,
    maxHealth: 20,
    speed: 5,
    bodyTexture: {
      front: "unit-front-no2",
      back: "unit-back-no2"
    }
  }),
  new CharacterData({
    index: 2,
    name: "폭스트롯",
    description: "알파 브라보 찰리 델타 에코 폭..",
    rarity: 1,
    maxHealth: 50,
    speed: 3,
    bodyTexture: {
      front: "unit-front-no3",
      back: "unit-back-no3"
    }
  }),

];

export default CharacterDatabase;