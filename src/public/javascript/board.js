/* global WeightedGraph Maze */

class Board {
  constructor(startKey, exitKey, mazeType, useWeights) {
    this.pathSlots = ["dijkstra"];
    this.c = document.getElementById("canvas");
    this.ctx = this.c.getContext("2d");
    this.reset(startKey, exitKey, mazeType, useWeights);
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
    this.canvasWidth = this.mapWidth * this.tileWidth;
    this.canvasHeight = this.mapHeight * this.tileHeight;
    this.c.height = this.canvasHeight;
    this.c.width = this.canvasWidth;
  }

  setSettings(startKey, exitKey) {
    this.startKey = this.randomKey();
    this.exitKey = this.randomKey();
    this.start = this.getCoords(this.startKey);
    this.exit = this.getCoords(this.exitKey);
    this.g = new WeightedGraph(this.start);
    this.path = null;
  }

  randomKey() {
    return Math.floor(Math.random() * this.mapWidth * this.mapHeight);
  }

  getCoords(key) {
    let yCount = 0;
    let newKey = key;
    while (newKey >= this.mapWidth) {
      yCount++;
      newKey -= this.mapWidth;
    }
    return {x: newKey * this.tileWidth, y: yCount * this.tileHeight};
  }

  reset(startKey, exitKey, mazeType, useWeights) {
    this.pathDisplayed = false;
    this.chosenPath;
    this.useWeights = useWeights === undefined ? false : useWeights;
    this.mazeType = mazeType;
    this.setMainHeight();
    this.setMapDimensions();
    this.setCanvasDimensions();
    this.setSettings(startKey, exitKey);
    this.draw();
  }

  draw() {
    this.drawMaze();
    this.redraw("exit");
    this.redraw("player");
  }

  drawMaze() {
    const maze = new Maze(
      this.ctx,
      this.g,
      this.start,
      this.exit,
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

  redraw(type, incrementKey, newStart, walkPath) {
    let redraw = false;
    let oldStart;
    let start;
    if (newStart === undefined) start = this.start;
    else start = newStart;
    if (incrementKey !== undefined && !this.useWeights) {
      redraw = true;
      oldStart = this.start;
      if (walkPath === true) {
        this.startKey = incrementKey;
        this.start = this.getCoords(this.startKey);
      } else if (
        walkPath === undefined &&
        this.g.vertexList[this.startKey + incrementKey].wall === 1
      ) {
        this.startKey += incrementKey;
        this.start = this.getCoords(this.startKey);
      } else if (
        walkPath === undefined &&
        this.g.vertexList[this.startKey + incrementKey].wall > 1 &&
        !this.useWeights
      ) {
        // player hit the wall
        this.randomReply();
        return;
      } else if (walkPath === undefined && this.useWeights) {
        // if bombs mode activated, can pass through wall
        this.startKey += incrementKey;
        this.start = this.getCoords(this.startKey);
        this.randomReply(this.bombsReplies());
      } else if (walkPath === true && this.useWeights) {
        this.startKey += incrementKey;
        this.start = this.getCoords(this.startKey);
        this.randomReply(this.bombsReplies());
      } else return;
    }
    let file;
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
        file = "/images/floor2.png";
        image.onload = () => {
          this.ctx.drawImage(image, start.x, start.y);
        };
        break;
      default:
        file = "/images/floor2.png";
        break;
    }
    image.src = file;
    if (oldStart !== undefined && redraw === true) {
      this.redraw("floor", undefined, oldStart);
    }
  }

  getPath() {
    if (this.chosenPath === undefined) {
      const num = Math.floor(Math.random() * this.pathSlots.length);
      this.chosenPath = this.pathSlots[num];
    }
  }

  findPath(start) {
    this.pathDisplayed = true;
    this.path = null;
    switch (this.chosenPath) {
      case "dijkstra":
        this.path = this.g.dijkstra(this.exit, start);
        break;
      default:
        this.path = null;
        break;
    }
    this.drawPath();
    return this.path;
  }

  drawPath() {
    const image = new Image();
    image.onload = () => {
      for (let i = 1; i < this.path.length - 1; i++) {
        this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(
          image,
          this.g.vertexList[this.path[i]].coords.x,
          this.g.vertexList[this.path[i]].coords.y,
        );
        this.ctx.globalAlpha = 1;
      }
    };
    image.src = "/images/path.png";
    this.redraw("exit");
    this.redraw("player");
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
