/* global mazeType exitPos playerPos minMoves wallArr useWeights aStar g monsterArr lastKey mapWidth mapHeight tileSize getKey getCoords ctx */
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
      return "/images/wall.png";
    case "player":
      return "/images/start.png";
    case "exit":
      return "/images/exit.png";
    case "blast":
      return "/images/blast.png";
    case "monster":
      return "/images/monster.png";
    case "path":
      return "/images/path.png";
    case "search":
      return "/images/searched.png";
    case "bomb":
      return "/images/bomb.png";
    case "floor":
      return "/images/floor2.png";
    default:
      return "/images/floor.png";
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
  }, 200);
}
