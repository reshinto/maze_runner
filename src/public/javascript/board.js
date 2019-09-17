/* global WeightedGraph Maze */

class Board {
  constructor(startKey, exitKey, mazeType, useWeights) {
    this.pathSlots = [
      "dijkstra",
      "a star",
      "breath first search",
      "depth first search",
    ];
    this.c = document.getElementById("canvas");
    this.ctx = this.c.getContext("2d");
    this.reset(startKey, exitKey, mazeType, useWeights);
  }

  reset(startKey, exitKey, mazeType, useWeights) {
    // this.pathDisplayed = false;
    // this.chosenPath;
    this.useWeights = useWeights === undefined ? false : useWeights;
    this.mazeType = mazeType;
    this.setMainHeight();
    this.setMapDimensions();
    this.setCanvasDimensions();
    this.setSettings(startKey, exitKey);
    this.draw();
  }

  getHeaderHeight() {
    const header = document.getElementsByTagName("header");
    const headerStr = window
      .getComputedStyle(header[0])
      .getPropertyValue("height");
    return headerStr.slice(0, headerStr.length - 2);
  }

  setMainHeight() {
    const main = document.getElementsByTagName("main");
    this.mainHeight = window.innerHeight - this.getHeaderHeight();
    main[0].style.height = `${this.mainHeight}px`;
  }

  setMapDimensions() {
    this.tileWidth = 30;
    this.tileHeight = 30;
    this.mapWidth = Math.round((window.innerWidth - 40) / this.tileWidth);
    this.mapHeight = Math.round((this.mainHeight - 40) / this.tileHeight);
  }

  setCanvasDimensions() {
    // this.canvasWidth = this.mapWidth * this.tileWidth;
    // this.canvasHeight = this.mapHeight * this.tileHeight;
    this.c.height = this.mapHeight * this.tileHeight;
    this.c.width = this.mapWidth * this.tileWidth;
  }

  setSettings(startKey, exitKey) {
    this.setPlayerLocation(startKey);
    this.setExitLocation(exitKey);
    this.setMonstersLocation();
    this.g = new WeightedGraph(
      this.ctx,
      this.start,
      this.mapWidth,
      this.tileWidth,
      this.monsterList,
    );
    this.path = null;
  }

  setPlayerLocation(startKey) {
    this.startKey = startKey !== undefined ? startKey : this.randomKey();
    this.start = getCoords(this.startKey, this.mapWidth, this.tileWidth);
  }

  setExitLocation(exitKey) {
    this.exitKey = exitKey !== undefined ? exitKey : this.randomKey();
    if (this.exitKey === this.startKey) {
      while (this.exitKey === this.startKey) {
        this.exitKey = this.randomKey();
      }
    }
    this.exit = getCoords(this.exitKey, this.mapWidth, this.tileWidth);
  }

  setMonstersLocation() {
    this.monsterList = [];
    this.monsterMovementType;
    this.monstersPathMap = {};
    let monstersMap = {};
    const randomCoordsArr = [];
    const randomMonsterNumber = Math.floor(Math.random() * (this.mapWidth / 5));
    // get monsters position
    while (randomCoordsArr.length < randomMonsterNumber) {
      const r = this.randomKey();
      if (
        randomCoordsArr.indexOf(r) === -1 &&
        r !== this.startKey &&
        r !== this.exitKey
      ) {
        randomCoordsArr.push(getCoords(r, this.mapWidth, this.tileWidth));
      }
    }
    // create each monster and assign position
    for (let i = 0; i < randomMonsterNumber; i++) {
      monstersMap = {};
      monstersMap[`monster${i}`] = randomCoordsArr[i];
      this.monsterList.push(monstersMap);
    }
  }

  randomKey() {
    return Math.floor(Math.random() * this.mapWidth * this.mapHeight);
  }

  draw() {
    this.drawMaze();
    // this.redraw("monster");
    this.redraw("exit");
    this.redraw("player");
  }

  drawMaze() {
    const maze = new Maze(
      this.ctx,
      this.g,
      this.startKey,
      this.start,
      this.exitKey,
      this.exit,
      this.monsterList,
      this.mapWidth,
      this.mapHeight,
      this.tileWidth,
      this.tileHeight,
      this.useWeights,
    );
    switch (this.mazeType) {
      case "recursive":
        this.world = maze.drawRecursiveMap();
        break;
      default:
        this.world = maze.drawRandomMazeMap();
        break;
    }
  }

  updatePlayerMovement(incrementKey, walkPath) {
    if (incrementKey !== undefined) {
      this.toRedraw = true;
      this.oldStart = this.start;
      if (walkPath === true && !this.useWeights) {
        // move player to new location automatically
        // use mainly for moving all the way to the exit
        this.startKey = incrementKey;
        this.start = getCoords(this.startKey, this.mapWidth, this.tileWidth);
      } else if (
        walkPath === undefined &&
        this.g.vertexList[this.startKey + incrementKey].wall === 1
      ) {
        // move player to new location manually by 1 step
        this.startKey += incrementKey;
        this.start = getCoords(this.startKey, this.mapWidth, this.tileWidth);
      } else if (
        walkPath === undefined &&
        this.g.vertexList[this.startKey + incrementKey].wall > 1 &&
        !this.useWeights
      ) {
        // player hit the wall
        this.randomReply();
      } else if (walkPath === undefined && this.useWeights) {
        // if bombs mode activated, can pass through wall
        this.startKey += incrementKey;
        this.start = getCoords(this.startKey, this.mapWidth, this.tileWidth);
        if (this.g.vertexList[this.startKey].wall > 1) {
          this.blast = true;
          this.randomReply(this.bombsReplies());
        }
      } else if (walkPath === true && this.useWeights) {
        // walk to path automatically, even through bombs
        this.startKey = incrementKey;
        this.start = getCoords(this.startKey, this.mapWidth, this.tileWidth);
        if (this.g.vertexList[this.startKey].wall > 1) {
          this.blast = true;
          this.randomReply(this.bombsReplies());
        }
      }
    }
  }

  redraw(type, incrementKey, newStart, walkPath) {
    this.toRedraw = false;
    this.oldStart;
    let start;
    let file;
    if (newStart === undefined) start = this.start;
    else start = newStart;
    this.updatePlayerMovement(incrementKey, walkPath);
    const image = new Image();
    switch (type) {
      case "wall":
        file = "/images/wall.png";
        break;
      case "player":
        file = "/images/start.png";
        image.onload = () => {
          this.ctx.drawImage(image, this.start.x, this.start.y);
        };
        break;
      case "exit":
        file = "/images/exit.png";
        image.onload = () => {
          this.ctx.drawImage(image, this.exit.x, this.exit.y);
        };
        break;
      case "floor":
        file = "/images/floor.png";
        image.onload = () => {
          this.ctx.drawImage(image, start.x, start.y);
        };
        break;
      case "blast":
        file = "/images/blast.png";
        image.onload = () => {
          this.ctx.drawImage(image, start.x, start.y);
        };
        break;
      default:
        break;
    }
    image.src = file;
    if (this.oldStart !== undefined && this.toRedraw && !this.useWeights) {
      this.redraw("floor", undefined, this.oldStart);
      this.redraw("player");
    } else if (
      this.oldStart !== undefined &&
      this.toRedraw &&
      this.useWeights
    ) {
      if (this.blast) {
        // clear player from previous position
        if (!this.prevBlast) this.redraw("floor", undefined, this.oldStart);
        else this.redraw("blast", undefined, this.oldStart);
        this.prevBlast = true;
        // add effect on current location
        this.redraw("blast", undefined, this.start);
        this.redraw("player");
        this.blast = false;
      } else {
        // remove player from blast at last blast location
        if (this.prevBlast) {
          this.prevBlast = false;
          this.redraw("blast", undefined, this.oldStart);
        } else this.redraw("floor", undefined, this.oldStart);
      }
    }
  }

  updateMonsterMovement(i, newKey) {
    if (newKey !== undefined) {
      this.oldMonsterStart = this.monsterList[i][`monster${i}`];
      this.monsterList[i][`monster${i}`] = getCoords(
        newKey,
        this.mapWidth,
        this.tileWidth,
      );
    }
  }

  redrawMonster(i, newKey) {
    const image = new Image();
    const start = this.monsterList[i][`monster${i}`];

    this.updateMonsterMovement(i, newKey);
    image.onload = () => {
      this.ctx.drawImage(image, start.x, start.y);
    };
    image.src = "/images/monster.png";
    this.redraw("floor", undefined, this.oldMonsterStart);
    // redraw monster at new position
    if (newKey !== undefined) this.redrawMonster(i);
  }

  startMonstersAttack() {
    if (this.monsterMovementType === undefined) {
      this.getPath();
      this.monsterMovementType = this.chosenPath;
    }
    for (let i = 0; i < this.monsterList.length; i++) {
      const start = this.monsterList[i][`monster${i}`];
      if (Object.entries(this.monstersPathMap).length === 0) {
        this.monstersPathMap[i] = this.findPath(start, this.start, true);
      } else if (this.monstersPathMap[i] === undefined) {
        this.monstersPathMap[i] = this.findPath(start, this.start, true);
      }
      if (this.monstersPathMap[i].length === 0) {
        this.monstersPathMap[i] = this.findPath(start, this.start, true);
      }
      this.redrawMonster(i, this.monstersPathMap[i].pop());
      this.redraw("floor", undefined, this.oldMonsterStart);
    }
  }

  getPath() {
    // if (this.chosenPath === undefined) {
    const num = Math.floor(Math.random() * this.pathSlots.length);
    this.chosenPath = this.pathSlots[num];
    console.log(this.chosenPath);
    // }
  }

  findPath(start, _exit, monsterUse = false, animateOff = false) {
    // this.pathDisplayed = true;
    const exit = _exit === undefined ? this.exit : _exit;
    let path;
    switch (this.chosenPath) {
      case "dijkstra":
        path = !monsterUse
          ? this.g.dijkstra(exit, start, animateOff)
          : this.g.dijkstraMonster(exit, start);
        break;
      case "a star":
        path = !monsterUse
          ? this.g.aStar(exit, start, animateOff)
          : this.g.aStarMonster(exit, start);
        break;
      case "breath first search":
        path = !monsterUse
          ? this.g.breathFirstSearch(exit, start, animateOff)
          : this.g.breathFirstSearchMonster(exit, start);
        break;
      case "depth first search":
        path = !monsterUse
          ? this.g.depthFirstSearch(exit, start, animateOff)
          : this.g.depthFirstSearchMonster(exit, start);
        break;
      default:
        break;
    }
    // this.chosenPath = undefined;
    this.redraw("exit");
    this.redraw("player");
    if (!monsterUse) this.path = path;
    return path;
  }

  randomReply(type = this.mazeReplies()) {
    const repliesArr = type;
    const randomNum = Math.floor(Math.random() * repliesArr.length);
    const msg = new SpeechSynthesisUtterance(repliesArr[randomNum]);
    window.speechSynthesis.speak(msg);
  }

  mazeReplies() {
    return [
      "Ouch!",
      "I can't go there!",
      "That hurts!",
      "Watch where you are going!",
      "You suck as this!",
      "I hate you!",
      "Ba ka!",
      "Stop driving me into the wall!",
      "You should be sent to a driving school!",
    ];
  }

  bombsReplies() {
    return [
      "Ouch!",
      "Damn! It hurts!",
      "No!",
      "I hate you!",
      "Stop killing me!",
    ];
  }
}

function getCoords(key, mapWidth, tileWidth) {
  // return x, y array index if tileWidth is not provided
  // return x, y actual coordinates if tileWidth is provided
  if (tileWidth === undefined) {
    return {
      x: key % mapWidth,
      y: Math.floor(key / mapWidth),
    };
  } else {
    return {
      x: (key % mapWidth) * tileWidth,
      y: Math.floor(key / mapWidth) * tileWidth,
    };
  }
}
