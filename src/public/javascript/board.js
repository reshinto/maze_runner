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

  dijkstra(finish) {
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

class Board {
  constructor(start, exit) {
    this.reset(start, exit);
  }

  randomPosition() {
    return {
      x: Math.floor(Math.random() * this.mapWidth) * 30,
      y: Math.floor(Math.random() * this.mapHeight) * 30,
    };
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
    this.c = document.getElementById("canvas");
    this.c.height = this.canvasHeight;
    this.c.width = this.canvasWidth;
    this.ctx = this.c.getContext("2d");
  }

  reset(start, exit) {
    this.setMainHeight();
    this.setMapDimensions();
    this.setCanvasDimensions();
    this.setSettings(start, exit);
    this.draw();
  }

  setSettings(start, exit) {
    this.start = start === undefined ? this.randomPosition() : start;
    this.exit = exit === undefined ? this.randomPosition() : exit;
    while (this.exit.x === this.start.x && this.exit.y === this.start.y) {
      this.exit = this.randomPosition();
    }
    this.g = new WeightedGraph(this.start);
    this.path = null;
  }

  getHeaderHeight() {
    const header = document.getElementsByTagName("header");
    const headerStr = window
      .getComputedStyle(header[0])
      .getPropertyValue("height");
    return headerStr.slice(0, headerStr.length - 2);
  }

  drawMaze() {
    // this.simpleMazeGenerator();
    this.weightMazeGenerator();
  }

  simpleMazeGenerator() {
    let coords;
    let vertex;
    this.useWeights = false;
    this.world = [[]];
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
  }

  weightMazeGenerator() {
    let coords;
    let vertex;
    this.useWeights = true;
    this.world = [[]];
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
  }

  randomWall(i, j, coords) {
    let wall;
    wall = Math.random() > 0.75 ? 5 : 1;
    if (coords.x === this.start.x && coords.y === this.start.y) wall = 1;
    if (coords.x === this.exit.x && coords.y === this.exit.y) wall = 1;
    return wall;
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

  findPath() {
    this.path = null;
    const pathSlots = ["dijkstra"];
    const num = Math.floor(Math.random() * pathSlots.length);
    switch (pathSlots[num]) {
      case "dijkstra":
        this.path = this.g.dijkstra(this.exit);
        break;
      default:
        this.path = null;
        break;
    }
    this.drawPath();
    return this.path;
  }

  draw() {
    this.drawMaze();
    this.redraw("exit");
    this.redraw("player");
  }

  drawPath() {
    const image = new Image();
    image.onload = () => {
      this.ctx.globalAlpha = 0.4;
      for (let i = 1; i < this.path.length - 1; i++) {
        this.ctx.drawImage(
          image,
          this.g.vertexList[this.path[i]].coords.x,
          this.g.vertexList[this.path[i]].coords.y
        );
      }
    };
    image.src = "/images/path.png";
    this.redraw("exit");
    this.redraw("player");
  }

  redraw(type) {
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
      default:
        file = "/images/floor2.png";
        break;
    }
    image.src = file;
  }
}

// const start = {x: 0, y: 0};
// const exit = {x: 90, y: 180};
let start;
let exit;

const b = new Board(start, exit);
window.addEventListener("resize", () => {
  b.reset();
});
const gacha = document.getElementById("gacha");
gacha.addEventListener("click", () => {
  console.log(b.findPath());
});
