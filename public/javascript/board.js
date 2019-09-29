/* global WeightedGraph dijkstra aStar  */
const minMoves = document.getElementById("min-moves");
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
let tileSize; // use for width and height;
let padding;
let mapWidth;
let mapHeight;
let mainHeight;
let playerPos;
let exitPos;
let monsterArr;
let wallArr;
let lastKey;
let g;
let useWeights;
let useSpeech;
let pathDisplayed;
let attackSignal;
let isRolled;
let delay;
let monsterMovementType;
let chosenPath;
let monstersPathMap;
let mazeType;
let pathSlots;
let searchFinished;
let slotAnimatingDone;
let helpPath;
let hp;

function initialSettings() {
  useSpeech = false;
  attackSignal = false;
  pathDisplayed = false;
  isRolled = false;
  delay = 500;
  monstersPathMap = {};
  tileSize = 30; // use for width and height;
  padding = 40;
  mapWidth = 0;
  mapHeight = 0;
  mainHeight = 0;
  playerPos = 0;
  exitPos = 0;
  monsterArr = [];
  wallArr = [];
  helpPath = [];
  hp = 3;
  lastKey = 0;
  g = undefined;
  monsterMovementType = "";
  chosenPath = "";
  slotAnimatingDone = false;
  searchFinished = false;
  minMoves.innerHTML = 0;
  pathSlots = [
    "dijkstra",
    "a star",
    // "breath first search",
    // "depth first search",
  ];
}

function getHeaderHeight() {
  const header = document.getElementById("header");
  const headerStr = window.getComputedStyle(header).getPropertyValue("height");
  return headerStr.slice(0, headerStr.length - 2);
}

function setMainHeight() {
  const main = document.getElementById("main");
  mainHeight = window.innerHeight - getHeaderHeight();
  main.style.height = `${mainHeight}px`;
}

function setMapDimensions() {
  mapWidth = Math.round((window.innerWidth - padding) / tileSize);
  mapHeight = Math.round((mainHeight - padding) / tileSize);
}

function setCanvasDimensions() {
  c.width = mapWidth * tileSize;
  c.height = mapHeight * tileSize;
}

function setSettings() {
  setPlayerPosition(randomKey());
  setExitPosition();
  setMonstersPosition();
  g = new WeightedGraph();
}

function randomKey() {
  return Math.floor(Math.random() * mapWidth * mapHeight);
}

function setPlayerPosition(key) {
  playerPos = key === undefined ? randomKey() : key;
}

function setExitPosition(key) {
  if (key !== undefined) exitPos = key;
  else {
    exitPos = randomKey();
    if (exitPos === playerPos) {
      while (exitPos === playerPos) {
        exitPos = randomKey();
      }
    }
  }
}

function generateRandomMonsterNumber() {
  // number of possible monsters increases as mapWidth increases
  return Math.floor(Math.random() * (mapWidth / 6));
}

function setMonstersPosition() {
  const arrSize = generateRandomMonsterNumber() + 1;
  const matchArr = new Array(arrSize);
  let r;
  monsterArr = new Array(arrSize).fill(null).map(() => {
    r = randomKey();
    while (matchArr.indexOf(r) !== -1 || r === playerPos || r === exitPos) {
      r = randomKey();
    }
    matchArr.push(r);
    return r;
  });
  return monsterArr;
}

function getLastKey() {
  const x = tileSize * mapWidth - tileSize;
  const y = tileSize * mapHeight - tileSize;
  return getKey(x, y);
}


function resetHp() {
  for (let i=1; i<=hp; i++) {
    document.getElementById(`hp${i}`).style.visibility = "visible";
  }
}

function reset(_mazeType, _useWeights) {
  initialSettings();
  useWeights = _useWeights === undefined ? false : _useWeights;
  mazeType = _mazeType === undefined ? "random" : _mazeType;
  setMainHeight();
  setMapDimensions();
  setCanvasDimensions();
  setSettings();
  lastKey = getLastKey();
  wallArr = new Array(lastKey).fill(1);
  drawMaze();
  resetHp();
}

function getCoords(key, tileSize) {
  if (tileSize === undefined) {
    // return x, y nested array index
    return {
      x: key % mapWidth,
      y: Math.floor(key / mapWidth),
    };
  } else {
    // return top left x, y actual coordinates
    return {
      x: (key % mapWidth) * tileSize,
      y: Math.floor(key / mapWidth) * tileSize,
    };
  }
}

function getKey(x, y) {
  return Math.floor(x / tileSize) + Math.floor(y / tileSize) * mapWidth;
}
