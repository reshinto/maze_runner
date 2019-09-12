class Maze {
  constructor(
    ctx,
    graph,
    startKey,
    start,
    exitKey,
    exit,
    mapWidth,
    mapHeight,
    tileWidth,
    tileHeight,
    useWeights
  ) {
    this.ctx = ctx;
    this.g = graph;
    this.startKey = startKey;
    this.start = start;
    this.exitKey = exitKey;
    this.exit = exit;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.useWeights = useWeights;
  }

  resetMaze() {
    this.world = [];
    this.contents = [];
  }

  drawRandomMazeMap() {
    let coords;
    let vertex;
    this.resetMaze();
    for (let i = 0; i < this.mapHeight; i++) {
      this.world[i] = [];
      for (let j = 0; j < this.mapWidth; j++) {
        coords = {x: j * this.tileWidth, y: i * this.tileHeight};
        vertex = {
          ctx: this.ctx,
          coords,
          start: this.start,
          exit: this.exit,
          wall: this.randomWall(i, j, coords),
          useWeights: this.useWeights,
          mapWidth: this.mapWidth,
          tileWidth: this.tileWidth,
        };
        this.world[i][j] = vertex.wall;
        this.g.addVertex(vertex);
      }
    }
    this.addConnections();
    return this.world;
  }

  randomWall(i, j, coords) {
    let wall;
    wall = Math.random() > 0.75 ? 5 : 1;
    if (coords.x === this.start.x && coords.y === this.start.y) wall = 1;
    if (coords.x === this.exit.x && coords.y === this.exit.y) wall = 1;
    return wall;
  }

  // Recursive Backtracker Algorithm
  drawRecursiveMap() {
    let coords;
    let vertex;
    let wall;
    this.resetMaze();
    for (let i = 0; i < this.mapHeight; i++) {
      this.contents[i] = [];
      this.world[i] = [];
      for (let j = 0; j < this.mapWidth; j++) {
        coords = {x: j * this.tileWidth, y: i * this.tileHeight};
        // surround entire maze with walls
        wall =
          i === 0 ||
          i === this.mapHeight - 1 ||
          j === 0 ||
          j === this.mapWidth - 1
            ? 5
            : 1;
        if (coords.x === this.start.x && coords.y === this.start.y) wall = 1;
        if (coords.x === this.exit.x && coords.y === this.exit.y) wall = 1;
        vertex = {
          ctx: this.ctx,
          coords,
          startKey: this.startKey,
          start: this.start,
          exitKey: this.exitKey,
          exit: this.exit,
          wall,
          useWeights: this.useWeights,
        };
        this.contents[i][j] = vertex;
        this.world[i][j] = wall;
        this.g.addVertex(vertex);
      }
    }
    this.drawRecursiveInnerWalls(0, this.mapWidth - 1, 0, this.mapHeight - 1);
    this.addConnections();
    return this.world;
  }

  drawRecursiveInnerWalls(x1, x2, y1, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    if (width >= height) {
      this.verticalBisection(x1, x2, y1, y2);
    } else {
      // horizontal bisection
      this.horizontalBisection(x1, x2, y1, y2);
    }
  }

  verticalBisection(x1, x2, y1, y2) {
    let bisection;
    let max;
    let min;
    let randomPassage;
    let current;
    let first = false;
    let second = false;
    if (x2 - x1 > 3) {
      bisection = Math.ceil((x1 + x2) / 2);
      max = y2 - 1;
      min = y1 + 1;
      randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
      if (this.contents[y2][bisection].wall === 1) {
        randomPassage = max;
        first = true;
      }
      if (this.contents[y1][bisection].wall === 1) {
        randomPassage = min;
        second = true;
      }
      for (let i = y1 + 1; i < y2; i++) {
        if (first && second) {
          if (i === max || i === min) continue;
        } else if (i === randomPassage) continue;
        current = this.contents[i][bisection];
        current.wall = 5;
        // ensure wall does not clash with start and exit
        if (
          current.coords.x === current.start.x &&
          current.coords.y === current.start.y
        ) {
          current.wall = 1;
        }
        if (
          current.coords.x === current.exit.x &&
          current.coords.y === current.exit.y
        ) {
          current.wall = 1;
        }
      }
      this.drawRecursiveInnerWalls(x1, bisection, y1, y2);
      this.drawRecursiveInnerWalls(bisection, x2, y1, y2);
    }
  }

  horizontalBisection(x1, x2, y1, y2) {
    let bisection;
    let max;
    let min;
    let randomPassage;
    let current;
    let first = false;
    let second = false;
    if (y2 - y1 > 3) {
      bisection = Math.ceil((y1 + y2) / 2);
      max = x2 - 1;
      min = x1 + 1;
      randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
      if (this.contents[bisection][x2].wall === 1) {
        randomPassage = max;
        first = true;
      }
      if (this.contents[bisection][x1].wall === 1) {
        randomPassage = min;
        second = true;
      }
      for (let i = x1 + 1; i < x2; i++) {
        if (first && second) {
          if (i === max || i === min) continue;
        } else if (i === randomPassage) continue;
        current = this.contents[bisection][i];
        current.wall = 5;
        // ensure wall does not clash with start and exit
        if (
          current.coords.x === current.start.x &&
          current.coords.y === current.start.y
        ) {
          current.wall = 1;
        }
        if (
          current.coords.x === current.exit.x &&
          current.coords.y === current.exit.y
        ) {
          current.wall = 1;
        }
      }
      this.drawRecursiveInnerWalls(x1, x2, y1, bisection);
      this.drawRecursiveInnerWalls(x1, x2, bisection, y2);
    }
  }

  addConnections() {
    let weight;
    let key = 0;
    for (let i = 0; i < this.mapHeight; i++) {
      this._addConnections(this.g, i, weight, this.useWeights);
      for (let j = 0; j < this.mapWidth; j++) {
        weight = this.world[i][j];
        this._addConnections(this.g, key, weight, this.useWeights);
        key++;
      }
    }
    this.g.drawGraph();
  }

  _addConnections(g, key, w, useW) {
    // nodes are added from top to bottom, left to right
    const k = key;
    const kx = this.mapWidth;
    const rightTopK = kx - 1;
    const lastK = this.mapWidth * this.mapHeight - 1;
    const leftBottomK = this.mapWidth * this.mapHeight - this.mapWidth;
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
    } else if (
      k !== rightTopK &&
      k !== lastK &&
      (k + 1) % this.mapWidth === 0
    ) {
      // right
      g.addEdge(k, k - kx, w, useW); // connect top
      g.addEdge(k, k + kx, w, useW); // connect bottom
      g.addEdge(k, k - 1, w, useW); // connect left
    } else if (k > leftBottomK && k < lastK) {
      // bottom
      g.addEdge(k, k - kx, w, useW); // connect top
      g.addEdge(k, k + 1, w, useW); // connect right
      g.addEdge(k, k - 1, w, useW); // connect left
    } else if (k !== 0 && k !== leftBottomK && k % this.mapWidth === 0) {
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
}
