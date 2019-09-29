/* global annyang WeightedGraph dijkstra aStar animatePath */
const moves = document.getElementById("moves");
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
  moves.innerHTML = 1;
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
function addRandomWalls() {
  // add random obstacles (bombs, walls, etc)
  for (let i = 0; i < wallArr.length; i++) {
    if (i !== playerPos && i !== exitPos && monsterArr.includes(i) === false) {
      wallArr[i] = Math.random() > 0.75 ? 5 : 1;
    }
  }
}

// Recursive Backtracker Algorithm
function addRecursiveWalls() {
  for (let i = 0; i <= lastKey; i++) {
    // surround entire maze with walls
    const k = i;
    const kx = mapWidth;
    const rightTopK = kx - 1;
    const lastK = lastKey;
    const leftBottomK = mapWidth * mapHeight - mapWidth;
    let wall =
      k === 0 ||
      k === rightTopK || // top-left top-right
      k === leftBottomK ||
      k === lastKey || // bottom-left bottom-right
      (k > 0 && k < rightTopK) || // top
      (k !== rightTopK && k !== lastK && (k + 1) % mapWidth === 0) || // right
      (k > leftBottomK && k < lastK) || // bottom
      (k !== 0 && k !== leftBottomK && k % mapWidth === 0) // left
        ? 5
        : 1;
    if (i === playerPos || i === exitPos || monsterArr.includes(i)) wall = 1;
    wallArr[i] = wall;
  }
  const {x, y} = getCoords(lastKey); // get x, y indexes of virtual nested array
  drawRecursiveInnerWalls(0, 0, x, y);
}

function drawRecursiveInnerWalls(x1, y1, x2, y2) {
  const width = x2 - x1;
  const height = y2 - y1;
  if (width >= height) {
    verticalBisection(x1, y1, x2, y2);
  } else {
    // horizontal bisection
    horizontalBisection(x1, y1, x2, y2);
  }
}

function verticalBisection(x1, y1, x2, y2) {
  let bisection;
  let max;
  let min;
  let randomPassage;
  let currentKey;
  let first = false;
  let second = false;
  let k;
  if (x2 - x1 > 3) {
    bisection = Math.ceil((x1 + x2) / 2);
    max = y2 - 1;
    min = y1 + 1;
    randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
    k = getKey(bisection * tileSize, y2 * tileSize);
    if (wallArr[k] === 1) {
      randomPassage = max;
      first = true;
    }
    k = getKey(bisection * tileSize, y1 * tileSize);
    if (wallArr[k] === 1) {
      randomPassage = min;
      second = true;
    }
    for (let i = y1 + 1; i < y2; i++) {
      if (first && second) {
        if (i === max || i === min) continue;
      } else if (i === randomPassage) continue;
      currentKey = getKey(bisection * tileSize, i * tileSize);
      wallArr[currentKey] = 5;
      // ensure wall does not clash with start and exit
      if (
        currentKey === playerPos ||
        currentKey === exitPos ||
        monsterArr.includes(currentKey)
      ) {
        wallArr[currentKey] = 1;
      }
    }
    drawRecursiveInnerWalls(x1, y1, bisection, y2);
    drawRecursiveInnerWalls(bisection, y1, x2, y2);
  }
}

function horizontalBisection(x1, y1, x2, y2) {
  let bisection;
  let max;
  let min;
  let randomPassage;
  let currentKey;
  let first = false;
  let second = false;
  let k;
  if (y2 - y1 > 3) {
    bisection = Math.ceil((y1 + y2) / 2);
    max = x2 - 1;
    min = x1 + 1;
    randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
    k = getKey(x2 * tileSize, bisection * tileSize);
    if (wallArr[k] === 1) {
      randomPassage = max;
      first = true;
    }
    k = getKey(x1 * tileSize, bisection * tileSize);
    if (wallArr[k] === 1) {
      randomPassage = min;
      second = true;
    }
    for (let i = x1 + 1; i < x2; i++) {
      if (first && second) {
        if (i === max || i === min) continue;
      } else if (i === randomPassage) continue;
      currentKey = getKey(i * tileSize, bisection * tileSize);
      wallArr[currentKey] = 5;
      // ensure wall does not clash with start and exit
      if (currentKey === playerPos) {
        wallArr[currentKey] = 1;
      }
      if (currentKey === exitPos) {
        wallArr[currentKey] = 1;
      }
      if (monsterArr.includes(currentKey)) {
        wallArr[currentKey] = 1;
      }
    }
    drawRecursiveInnerWalls(x1, y1, x2, bisection);
    drawRecursiveInnerWalls(x1, bisection, x2, y2);
  }
}

function getImgFile(type) {
  switch (type) {
    case "wall":
      return "./public/images/wall.png";
    case "player":
      return "./public/images/start.png";
    case "exit":
      return "./public/images/exit.png";
    case "blast":
      return "./public/images/blast.png";
    case "monster":
      return "./public/images/monster.png";
    case "path":
      return "./public/images/path.png";
    case "search":
      return "./public/images/searched.png";
    case "bomb":
      return "./public/images/bomb.png";
    case "floor":
      return "./public/images/floor2.png";
    default:
      return "./public/images/floor.png";
  }
}

function draw(key, type) {
  const {x, y} = getCoords(Number(key), tileSize);
  const img = new Image();
  const file = getImgFile(type);
  img.onload = () => {
    ctx.drawImage(img, x, y);
  };
  img.src = file;
}

function drawFloor() {
  for (let i = 0; i <= lastKey; i++) {
    g.addVertex(String(i));
    draw(i);
  }
}

function drawMonsters() {
  for (let i = 0; i < monsterArr.length; i++) {
    draw(monsterArr[i], "monster");
  }
}

function drawConnections() {
  for (let i = 0; i <= lastKey; i++) {
    if (wallArr[i] === 5) {
      if (useWeights) {
        draw(i, "bomb");
      } else if (!useWeights) {
        draw(i, "wall");
      }
    }
    addConnections(i, wallArr[i], useWeights);
  }
}

function getBotLeftTopRightCoords() {
  const topRight = mapWidth - 1;
  const bottomLeft = mapWidth * mapHeight - mapWidth;
  return [topRight, bottomLeft];
}

function addConnections(key, w, useW) {
  // nodes are added from top to bottom, left to right
  const k = key;
  const kx = mapWidth;
  const lastK = lastKey;
  const [rightTopK, leftBottomK] = getBotLeftTopRightCoords();
  if (k === 0) {
    // top left
    g.addEdge(k, k + 1, w, useW); // connect right
    g.addEdge(k, k + kx, w, useW); // connect bottom
  } else if (k === rightTopK) {
    // top right
    g.addEdge(k, k + kx, w, useW); // connect bottom
    g.addEdge(k, k - 1, w, useW); // connect left
  } else if (k === lastK) {
    // bottom right
    g.addEdge(k, k - kx, w, useW); // connect top
    g.addEdge(k, k - 1, w, useW); // connect left
  } else if (k === leftBottomK) {
    // bottom left
    g.addEdge(k, k - kx, w, useW); // connect top
    g.addEdge(k, k + 1, w, useW); // connect right
  } else if (k > 0 && k < rightTopK) {
    // top
    g.addEdge(k, k + 1, w, useW); // connect right
    g.addEdge(k, k + kx, w, useW); // connect bottom
    g.addEdge(k, k - 1, w, useW); // connect left
  } else if (k !== rightTopK && k !== lastK && (k + 1) % mapWidth === 0) {
    // right
    g.addEdge(k, k - kx, w, useW); // connect top
    g.addEdge(k, k + kx, w, useW); // connect bottom
    g.addEdge(k, k - 1, w, useW); // connect left
  } else if (k > leftBottomK && k < lastK) {
    // bottom
    g.addEdge(k, k - kx, w, useW); // connect top
    g.addEdge(k, k + 1, w, useW); // connect right
    g.addEdge(k, k - 1, w, useW); // connect left
  } else if (k !== 0 && k !== leftBottomK && k % mapWidth === 0) {
    // left
    g.addEdge(k, k - kx, w, useW); // connect top
    g.addEdge(k, k + 1, w, useW); // connect right
    g.addEdge(k, k + kx, w, useW); // connect bottom
  } else {
    g.addEdge(k, k - kx, w, useW); // connect top
    g.addEdge(k, k + 1, w, useW); // connect right
    g.addEdge(k, k + kx, w, useW); // connect bottom
    g.addEdge(k, k - 1, w, useW); // connect left
  }
}

function drawMaze() {
  mazeType === "random" ? addRandomWalls() : addRecursiveWalls();
  drawFloor();
  setTimeout(() => {
    drawMonsters();
    draw(exitPos, "exit");
    draw(playerPos, "player");
    drawConnections();
    const minPath = aStar(String(playerPos), String(exitPos), g, false);
    if (!useWeights) {
      minMoves.innerHTML = minPath.length;
    } else {
      for (let i = 0; i < minPath.length; i++) {
        if (wallArr[Number(minPath[i])] === 5) {
          minMoves.innerHTML = Number(minMoves.innerHTML) + 5;
        } else {
          minMoves.innerHTML = Number(minMoves.innerHTML) + 1;
        }
      }
    }
  }, 800);
}

// tutorial events
const tutorials = document.getElementById("tutorials");
const options = document.getElementById("options");
const tutorial = document.getElementById("tutorial");
const skip = document.getElementById("skip");
skip.addEventListener("click", () => {
  tutorials.style.display = "none";
});

const prev = document.getElementById("prev");
prev.addEventListener("click", () => {
  options.style.display = "flex";
  tutorial.style.display = "none";
  prev.style.display = "none";
  next.style.display = "block";
  skip.innerHTML = "Skip Tutorial";
});

const next = document.getElementById("next");
next.addEventListener("click", () => {
  options.style.display = "none";
  tutorial.style.display = "flex";
  prev.style.display = "block";
  next.style.display = "none";
  skip.innerHTML = "Close Tutorial";
});

// status events
const newGame = document.getElementById("new");
newGame.addEventListener("click", () => {
  // attackSignal = false;
  isRolled = false;
  reset(mazeType, useWeights);
});

const start = document.getElementById("start");
start.addEventListener("click", () => {
  attackSignal = true;
  const interval = setInterval(() => {
    if (attackSignal === false) {
      clearInterval(interval);
    }
    startMonstersAttack();
  }, delay);
});

const gacha = document.getElementById("gacha");
gacha.addEventListener("click", () => {
  if (!isRolled) {
    attackSignal = false;
    getChosenPath();
    slotC.style.visibility = "visible";
    animateSlot();
    txtToSpeech(`Rolling`);
    setTimeout(() => {
      if (slotAnimatingDone) {
        txtToSpeech(`You have rolled ${chosenPath}`);
        slotC.style.visibility = "hidden";
        helpPath = getPath();
        const pathInterval = setInterval(() => {
          if (searchFinished) {
            animatePath(helpPath);
            clearInterval(pathInterval);
          }
        }, 500);
      }
    }, 5000);
  } else {
    txtToSpeech(`You have already rolled ${chosenPath}`);
  }
  isRolled = true;
});

const recursiveLink = document.getElementById("recursive");
recursiveLink.addEventListener("click", () => {
  isRolled = false;
  mazeType = "recursive";
  reset(mazeType, useWeights);
});

const randomLink = document.getElementById("random");
randomLink.addEventListener("click", () => {
  isRolled = false;
  mazeType = "random";
  reset(mazeType, useWeights);
});

const mazeLink = document.getElementById("maze");
mazeLink.addEventListener("click", () => {
  isRolled = false;
  useWeights = false;
  reset(mazeType, useWeights);
});

const bombsLink = document.getElementById("bombs");
bombsLink.addEventListener("click", () => {
  isRolled = false;
  useWeights = true;
  reset(mazeType, useWeights);
});

const speechOnLink = document.getElementById("speechOn");
speechOnLink.addEventListener("click", () => {
  useSpeech = true;
  activateSpeech();
});

const speechOffLink = document.getElementById("speechOff");
speechOffLink.addEventListener("click", () => {
  useSpeech = false;
  activateSpeech();
});

// Slot events
const slotC = document.getElementById("slot");
const slotCtx = slotC.getContext("2d");
slotC.style.visibility = "hidden";

function animateSlot() {
  slotC.height = Math.floor(mainHeight * 0.2);
  slotC.width = window.innerWidth;
  const pathResult = chosenPath; // display random result
  const pathList = pathSlots; // display all possible paths
  // Font size and overall scale
  const scale = Math.floor(window.innerWidth * 0.06);
  const breaks = 0.003; // Speed loss per frame
  const endSpeed = 0.05; // Speed at which the text stops
  const numOfFrames = 220; // number of frames until text stops (60/s)
  // const delay = 40; // number of frames between texts
  const pathMap = [];
  let offsetV = endSpeed + breaks * numOfFrames;
  let offset = (-(1 + numOfFrames) * (breaks * numOfFrames + 2 * endSpeed)) / 2;

  for (let i = 0; i < pathList.length; i++) {
    pathMap[pathList[i]] = i;
  }
  function animate() {
    slotCtx.setTransform(1, 0, 0, 1, 0, 0);
    slotCtx.clearRect(0, 0, slotC.width, slotC.height);
    slotCtx.globalAlpha = 1;
    slotCtx.fillStyle = "#622";
    slotCtx.fillRect(0, (slotC.height - scale) / 2, slotC.width, scale);
    slotCtx.fillStyle = "#ccc";
    slotCtx.textBaseline = "middle";
    slotCtx.textAlign = "center";
    slotCtx.setTransform(
      1,
      0,
      0,
      1,
      Math.floor(slotC.width / 2),
      Math.floor(slotC.height / 2),
    );
    let o = offset;
    while (o < 0) o++; // ensure smooth spin stop
    o %= 1;
    const h = Math.ceil(slotC.height / 2 / scale);
    for (let j = -h; j < h; j++) {
      let c = pathMap[pathResult] + j - Math.floor(offset);
      while (c < 0) c += pathList.length;
      c %= pathList.length;
      const s = 1 - Math.abs(j + o) / (slotC.height / 2 / scale + 1);
      slotCtx.globalAlpha = s;
      slotCtx.font = scale * s + "px Helvetica";
      slotCtx.fillText(pathList[c], 0, (j + o) * scale);
    }
    offset += offsetV; // required for spining
    offsetV -= breaks; // required for slowing down spin
    if (offsetV < endSpeed) {
      // required for stopping spin
      offset = 0;
      offsetV = 0;
    }
    if (offset === 0 && offsetV === 0) {
      slotAnimatingDone = true;
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// Keyboard presses events
function handleBlast(newPos) {
  if (wallArr[playerPos] === 5 && wallArr[newPos] === 1) {
    draw(playerPos, "blast");
  } else if (wallArr[playerPos] === 5 && wallArr[newPos] === 5) {
    draw(playerPos, "blast");
  } else draw(playerPos);
}

window.addEventListener("keydown", keyboardEvents);

function keyboardEvents(e) {
  switch (e.keyCode) {
    case 87:
    case 38:
      move("up");
      break;
    case 68:
    case 39:
      move("right");
      break;
    case 83:
    case 40:
      move("down");
      break;
    case 65:
    case 37:
      move("left");
      break;
    default:
      break;
  }
  if (playerPos === exitPos) {
    setTimeout(() => {
      alert("end game");
      reset(mazeType, useWeights);
      attackSignal = true;
    }, 200);
  }
}

function getNewPosition(type) {
  switch (type) {
    case "up":
      return playerPos - mapWidth;
    case "down":
      return playerPos + mapWidth;
    case "right":
      return playerPos + 1;
    case "left":
      return playerPos - 1;
    default:
      return undefined;
  }
}

function move(type) {
  const {x} = getCoords(playerPos);
  const newPos = getNewPosition(type);
  if (!useWeights && wallArr[newPos] === 5) {
    moves.innerHTML = Number(moves.innerHTML) + 1;
    return randomReply();
  } else if (useWeights && wallArr[newPos] === 5) {
    draw(newPos, "blast");
    randomReply();
  }
  switch (type) {
    case "up":
      if (playerPos >= mapWidth) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else {
        randomReply();
      }
      break;
    case "down":
      if (playerPos <= lastKey - mapWidth) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else {
        randomReply();
      }
      break;
    case "right":
      if (x < mapWidth - 1) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else randomReply();
      break;
    case "left":
      if (x > 0) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else {
        randomReply();
      }
      break;
    default:
      randomReply();
  }
  if (!useWeights) {
    moves.innerHTML = Number(moves.innerHTML) + 1;
  } else {
    if (wallArr[Number(playerPos)] === 5) {
      moves.innerHTML = Number(moves.innerHTML) + 5;
    } else {
      moves.innerHTML = Number(moves.innerHTML) + 1;
    }
  }
}

// speech helper functions
function randomReply() {
  const repliesArr = useWeights === false ? mazeReplies() : bombsReplies();
  const randomNum = Math.floor(Math.random() * repliesArr.length);
  txtToSpeech(repliesArr[randomNum]);
}

// Text to speech events
function txtToSpeech(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "ja-JP";
  window.speechSynthesis.speak(msg);
}

function mazeReplies() {
  return [
    "Ouch!",
    "I can't go there!",
    "That hurts!",
    "Watch where you are going!",
    "You suck as this!",
    "I hate you!",
    "ばか!",
    "Stop driving me into the wall!",
    "You should be sent to a driving school!",
  ];
}

function bombsReplies() {
  return ["Ouch!", "Damn! It hurts!", "No!", "I hate you!", "Stop killing me!"];
}

// Voice command events
function commands() {
  // Define commands
  return {
    // "move up": move("up"),
    // "move up to end": function() {
    //   txtToSpeech("moving up.");
    //   for (let i = 0; i < mapHeight; i++) {
    //     (function(i) {
    //       setTimeout(() => {
    //         move("up");
    //       }, 300 * i);
    //     })(i);
    //   }
    // },
    // "move right": move("right"),
    // "move right to end": function() {
    //   txtToSpeech("moving right.");
    //   for (let i = 0; i < mapWidth; i++) {
    //     (function(i) {
    //       setTimeout(() => {
    //         move("right");
    //       }, 300 * i);
    //     })(i);
    //   }
    // },
    // "move down": move("down"),
    // "move down to end": function() {
    //   txtToSpeech("moving down.");
    //   for (let i = 0; i < mapHeight; i++) {
    //     (function(i) {
    //       setTimeout(() => {
    //         move("down");
    //       }, 300 * i);
    //     })(i);
    //   }
    // },
    // "move left": move("left"),
    // "move left to end": function() {
    //   txtToSpeech("moving left.");
    //   for (let i = 0; i < mapWidth; i++) {
    //     (function(i) {
    //       setTimeout(() => {
    //         move("left");
    //       }, 300 * i);
    //     })(i);
    //   }
    // },
    "new game": function() {
      attackSignal = false;
      isRolled = false;
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "help": function() {
      if (!isRolled) {
        attackSignal = false;
        getChosenPath();
        slotC.style.visibility = "visible";
        animateSlot();
        txtToSpeech(`Rolling`);
        const slotInterval = setInterval(() => {
          if (slotAnimatingDone) {
            txtToSpeech(`You have rolled ${chosenPath}`);
            slotC.style.visibility = "hidden";
            clearInterval(slotInterval);
            helpPath = getPath();
            const pathInterval = setInterval(() => {
              if (searchFinished) {
                pathDisplayed = true;
                animatePath(helpPath);
                clearInterval(pathInterval);
              }
            }, 500);
          }
        }, 1000);
      } else {
        txtToSpeech(`You have already rolled ${chosenPath}`);
      }
      isRolled = true;
    },
    "end game": function() {
      if (pathDisplayed === true) {
        const path = getPath(false);
        for (let i = 0; i < path.length; i++) {
          (function(i) {
            setTimeout(() => {
              draw(playerPos);
              playerPos = path[i];
              draw(playerPos, "player");
              if (Number(playerPos) === exitPos) {
                setTimeout(() => {
                  alert("end game");
                  reset(mazeType, useWeights);
                }, 200);
              }
            }, 300 * i);
          })(i);
        }
      } else {
        txtToSpeech("No cheating allowed.");
      }
    },
    "activate recursive maze": function() {
      isRolled = false;
      attackSignal = false;
      mazeType = "recursive";
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "activate random maze": function() {
      isRolled = false;
      attackSignal = false;
      mazeType = "random";
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "activate bombs mode": function() {
      isRolled = false;
      attackSignal = false;
      useWeights = true;
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "activate maze mode": function() {
      isRolled = false;
      attackSignal = false;
      useWeights = false;
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "deactivate voice mode": function() {
      useSpeech = false;
      activateSpeech();
      txtToSpeech("Voice mode deactivated.");
    },
  };
}

function activateSpeech() {
  if (useSpeech) {
    if (annyang) {
      txtToSpeech("Voice mode activated. Please give your command.");

      // Add commands to annyang
      annyang.addCommands(commands());

      // Start listening.
      annyang.start({paused: false});

      annyang.addCallback("soundstart", function() {
        console.log("sound detected");
      });
    } else {
      annyang.abort();
    }
  }
}

function getChosenPath() {
  const num = Math.floor(Math.random() * pathSlots.length);
  chosenPath = pathSlots[num];
  return chosenPath;
}

function getPath(animate = true) {
  return findPath(playerPos, exitPos, g, animate);
}

function findPath(start, _exit, g, animate = true) {
  start = String(start);
  const exit = _exit === undefined ? String(exitPos) : String(_exit);
  let path;
  switch (chosenPath) {
    case "dijkstra":
      path = dijkstra(start, exit, g, animate);
      break;
    case "a star":
      path = aStar(start, exit, g, animate);
      break;
    // case "breath first search":
    //   return breathFirstSearch(start, exit, g);
    //   break;
    // case "depth first search":
    //   return depthFirstSearch(start, exit, g, animateOff);
    default:
      break;
  }
  return path;
}

function startMonstersAttack() {
  // loop through each monster
  for (let i = 0; i < monsterArr.length; i++) {
    // allow each monster to use different path algorithm
    monsterMovementType = getChosenPath();
    const start = monsterArr[i];
    // check if any path been searched for monsters
    if (Object.entries(monstersPathMap).length === 0) {
      monstersPathMap[i] = findPath(start, playerPos, g, false).reverse();
      monstersPathMap[i].pop();
      // check if next monster path has been searched
    } else if (monstersPathMap[i] === undefined) {
      monstersPathMap[i] = findPath(start, playerPos, g, false).reverse();
      monstersPathMap[i].pop();
    }
    // check if a monster path has finished
    if (monstersPathMap[i].length === 0) {
      monstersPathMap[i] = findPath(start, playerPos, g, false).reverse();
      monstersPathMap[i].pop();
    }
    draw(monsterArr[i]);
    monsterArr[i] = monstersPathMap[i].pop();
    draw(start, "floor");
    draw(monsterArr[i], "monster");
    if (monsterArr[i] === String(playerPos)) {
      document.getElementById(`hp${hp}`).style.visibility = "hidden";
      hp -= 1;
      if (hp <= 0) {
        setTimeout(() => {
          alert("GAME OVER!");
          reset(mazeType, useWeights);
        }, 400);
      }
    }
  }
}

reset("random", false);
window.addEventListener("resize", () => {
  reset(mazeType, useWeights);
});
