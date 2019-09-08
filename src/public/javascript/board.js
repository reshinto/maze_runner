class Node {
  constructor(key, weight, vertex) {
    const image = new Image();
    this.key = key;
    this.weight = weight;
    this.vertex = vertex;
    image.onload = () => {
      this.vertex.ctx.drawImage(
        image,
        this.vertex.coords.x,
        this.vertex.coords.y
      );
    };
    image.src = "/images/floor2.png";

    if (this.vertex.wall >= 2) {
      const image2 = new Image();
      image2.onload = () => {
        this.vertex.ctx.drawImage(
          image2,
          this.vertex.coords.x,
          this.vertex.coords.y
        );
      };
      image2.src = !vertex.useWeights ? "/images/wall.png" : "/images/bomb.png";
    }
  }
}

class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(vertex, weight, vertexList) {
    const newNode = new Node(vertex, weight, vertexList);
    this.values.push(newNode);
    this.bubbleUp();
  }

  bubbleUp() {
    let index = this.values.length - 1;
    const element = this.values[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.values[parentIndex];
      if (element.weight >= parent.weight) break;
      this.values[parentIndex] = element;
      this.values[index] = parent;
      index = parentIndex;
    }
  }

  dequeue() {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0) {
      this.values[0] = end;
      this.bubbleDown();
    }
    return min;
  }

  bubbleDown() {
    let index = 0;
    const length = this.values.length;
    const element = this.values[0];
    while (this.values) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild;
      let rightChild;
      let swap = null;
      if (leftChildIndex < length) {
        leftChild = this.values[leftChildIndex];
        if (leftChild.weight < element.weight) {
          swap = leftChildIndex;
        }
      }
      if (rightChildIndex < length) {
        rightChild = this.values[rightChildIndex];
        if (
          (swap === null && rightChild.weight < element.weight) ||
          (swap !== null && rightChild.weight < leftChild.weight)
        ) {
          swap = rightChildIndex;
        }
      }
      if (swap === null) break;
      this.values[index] = this.values[swap];
      this.values[swap] = element;
      index = swap;
    }
  }
}

class WeightedGraph {
  constructor(start) {
    this.vertexList = [];
    this.adjacencyList = {};
    this.start = start;
    this.key = 0;
    this.searched = false;
  }

  resetGraph() {
    this.pq = new PriorityQueue();
    this.distances = {};
    this.previous = {};
    this.path = [];
    this.smallest = undefined;
  }

  addVertex(vertex) {
    const key = String(this.key);
    this.adjacencyList[key] = [];
    this.vertexList.push(vertex);
    this.key++;
  }

  addEdge(k1, k2, weight, useWeights) {
    const key1 = String(k1);
    const key2 = String(k2);
    if (!useWeights) {
      this._addWallEdge(key1, key2, weight);
    } else {
      this._addWeightEdge(key1, key2, weight);
    }
  }

  _addWallEdge(k1, k2, weight) {
    if (this.vertexList[k1].wall === 1 && this.vertexList[k2].wall === 1) {
      this._addEdge(k1, k2, weight);
    }
  }

  _addWeightEdge(k1, k2, weight) {
    if (this.vertexList[k1].wall > this.vertexList[k2].wall) {
      weight = this.vertexList[k1].wall;
    } else if (this.vertexList[k2].wall > this.vertexList[k1].wall) {
      weight = this.vertexList[k2].wall;
    }
    this._addEdge(k1, k2, weight);
  }

  _addEdge(k1, k2, weight) {
    this.adjacencyList[k1].push({
      node: k2,
      weight,
    });
    this.adjacencyList[k2].push({
      node: k1,
      weight,
    });
  }

  drawGraph() {
    this.resetGraph();
    Object.keys(this.adjacencyList).forEach((key) => {
      if (
        this.vertexList[key]["coords"].x === this.start.x &&
        this.vertexList[key]["coords"].y === this.start.y
      ) {
        this.distances[key] = 0;
        this.pq.enqueue(key, 0, this.vertexList[key]);
      } else {
        this.distances[key] = Infinity;
        this.pq.enqueue(key, Infinity, this.vertexList[key]);
      }
      this.previous[key] = null;
    });
  }

  dijkstra(finish, start) {
    if (start !== undefined) {
      this.start = start;
      this.drawGraph();
    }
    if (this.searched) this.drawGraph();
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      this.smallest = currentNode.key;
      if (
        this.vertexList[this.smallest].coords.x === finish.x &&
        this.vertexList[this.smallest].coords.y === finish.y
      ) {
        while (this.previous[this.smallest]) {
          this.path.push(this.smallest);
          this.smallest = this.previous[this.smallest];
        }
        break;
      }
      if (this.smallest || this.distances[this.smallest] !== Infinity) {
        for (let i = 0; i < this.adjacencyList[this.smallest].length; i++) {
          const nextNode = this.adjacencyList[this.smallest][i];
          const candidate = this.distances[this.smallest] + nextNode.weight;
          const nextNeighbor = nextNode.node;
          if (candidate < this.distances[nextNode.node]) {
            this.distances[nextNeighbor] = candidate;
            this.previous[nextNeighbor] = this.smallest;
            this.pq.enqueue(
              nextNeighbor,
              candidate,
              this.vertexList[this.smallest]
            );
          }
        }
      }
    }
    this.searched = true;
    return this.path.concat(this.smallest).reverse();
  }
}

class Maze {
  constructor(
    ctx,
    graph,
    start,
    exit,
    mapWidth,
    mapHeight,
    tileWidth,
    tileHeight,
    useWeights
  ) {
    this.ctx = ctx;
    this.g = graph;
    this.start = start;
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
          start: this.start,
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

class Board {
  constructor(startKey, exitKey, mazeType, useWeights) {
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
    return {x: newKey*this.tileWidth, y: yCount*this.tileHeight};
  }

  reset(startKey, exitKey, mazeType, useWeights) {
    this.useWeights = useWeights === undefined ? false: useWeights;
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
      this.useWeights
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

  redraw(type, incrementKey, newStart) {
    let redraw = false;
    let oldStart;
    if (newStart === undefined) start = this.start;
    else start = newStart;
    if (incrementKey !== undefined) {
      redraw = true;
      oldStart = this.start;
      if (this.g.vertexList[this.startKey+incrementKey].wall === 1) {
        this.startKey += incrementKey;
        this.start = this.getCoords(this.startKey);
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

  findPath(start) {
    this.path = null;
    const pathSlots = ["dijkstra"];
    const num = Math.floor(Math.random() * pathSlots.length);
    switch (pathSlots[num]) {
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
          this.g.vertexList[this.path[i]].coords.y
        );
        this.ctx.globalAlpha = 1;
      }
    };
    image.src = "/images/path.png";
    this.redraw("exit");
    this.redraw("player");
  }
}

// const start = {x: 0, y: 0};
// const exit = {x: 90, y: 180};
let start;
let exit;
const mazeType = "recursive";
const useWeights = false;

const b = new Board(start, exit, mazeType, useWeights);
window.addEventListener("resize", () => {
  b.reset(start, exit, mazeType, useWeights);
});
const gacha = document.getElementById("gacha");
gacha.addEventListener("click", () => {
  b.findPath(b.start);
});

window.addEventListener("keydown", check, false);

function check(e) {
  switch (e.keyCode) {
    case 87:
    case 38:
      // up
      if (b.start.y > 0) {
        b.redraw("player", -b.mapWidth);
      }
      break;
    case 68:
    case 39:
      // right
      if (b.start.x < b.mapWidth*b.tileWidth - b.tileWidth) {
        b.redraw("player", 1);
      }
      break;
    case 83:
    case 40:
      // down
      if (b.start.y < b.mapHeight*b.tileHeight - b.tileHeight) {
        b.redraw("player", +b.mapWidth);
      }
      break;
    case 65:
    case 37:
      // left
      if (b.start.x > 0) {
        b.redraw("player", -1);
      }
      break;
    default:
      break;
  }
  if (b.startKey === b.exitKey) {
    setTimeout(()=> {
      alert("end game");
      b.reset(start, exit, mazeType, useWeights);
    }, 200);
  }
}
