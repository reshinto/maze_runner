class Node {
  constructor(key, weight, vertexList) {
    this.key = key;
    this.weight = weight;
    this.vertex = vertexList[key];
    this.floorImg = "/images/floor2.png";
    const image = new Image();
    image.onload = () => {
      this.vertex.ctx.drawImage(
        image,
        this.vertex.coords.x,
        this.vertex.coords.y
      );
    };
    image.src = this.floorImg;
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
    this.newFloorImg = "/images/floor.png";
    this.start = start;
    this.key = 0;
  }

  resetGraph() {
    this.pq = new PriorityQueue();
    this.distances = {};
    this.previous = {};
    this.path = [];
    this.smallest = undefined;
  }

  addVertex(vertex) {
    if (!this.adjacencyList[this.key]) {
      this.adjacencyList[this.key] = [];
      this.vertexList.push(vertex);
    }
    this.key++;
  }

  addEdge(k1, k2, weight) {
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
        this.pq.enqueue(key, 0, this.vertexList);
      } else {
        this.distances[key] = Infinity;
        this.pq.enqueue(key, Infinity, this.vertexList);
      }
      this.previous[key] = null;
    });
  }

  dijkstra(finish) {
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      this.smallest = currentNode.key;
      if (
        this.vertexList[this.smallest].coords.x === finish.x &&
        this.vertexList[this.smallest].coords.y === finish.y
      ) {
        while (this.previous[this.smallest]) {
          // currentNode.floorImg = this.newFloorImg;
          this.path.push(Number(this.smallest));
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
            this.pq.enqueue(nextNeighbor, candidate, this.vertexList);
          }
        }
      }
    }
    // this.smallest.floorImg = this.newFloorImg;
    return this.path.concat(Number(this.smallest)).reverse();
  }
}

class Board {
  constructor(start, exit) {
    this.setDimensions();
    this.start = start;
    this.exit = exit;
    this.g = new WeightedGraph(this.start);
    this.path;
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

  setDimensions() {
    this.setMainHeight();
    this.setMapDimensions();
    this.setCanvasDimensions();
  }

  getHeaderHeight() {
    const header = document.getElementsByTagName("header");
    const headerStr = window
      .getComputedStyle(header[0])
      .getPropertyValue("height");
    return headerStr.slice(0, headerStr.length - 2);
  }

  drawTiles() {
    const g = this.g;
    let vertex;
    let key = 0;
    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        vertex = {};
        vertex = {
          ctx: this.ctx,
          coords: {x: j * this.tileWidth, y: i * this.tileHeight},
        };
        g.addVertex(vertex);
      }
    }
    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        this.addConnections(g, key, 1);
        key++;
      }
    }
    g.drawGraph();
  }

  addConnections(g, key, w) {
    // nodes are added from top to bottom, left to right
    const k = key;
    const kx = this.mapWidth;
    const rightTopK = kx - 1;
    const lastK = this.mapWidth * this.mapHeight - 1;
    const leftBottomK = this.mapWidth * this.mapHeight - this.mapWidth;
    if (k === 0) {
      // top left
      g.addEdge(k, k + 1, w); // connect right
      g.addEdge(k, k + kx, w); // connect bottom
    } else if (k === rightTopK) {
      // top right
      g.addEdge(k, k + kx, w); // connect bottom
      g.addEdge(k, k - 1, w); // connect left
    } else if (k === lastK) {
      // bottom right
      g.addEdge(k, k - kx, w); // connect top
      g.addEdge(k, k - 1, w); // connect left
    } else if (k === leftBottomK) {
      // bottom left
      g.addEdge(k, k - kx, w); // connect top
      g.addEdge(k, k + 1, w); // connect right
    } else if (k > 0 && k < rightTopK) {
      // top
      g.addEdge(k, k + 1, w); // connect right
      g.addEdge(k, k + kx, w); // connect bottom
      g.addEdge(k, k - 1, w); // connect left
    } else if (
      k !== rightTopK &&
      k !== lastK &&
      (k + 1) % this.mapWidth === 0
    ) {
      // right
      g.addEdge(k, k - kx, w); // connect top
      g.addEdge(k, k + kx, w); // connect bottom
      g.addEdge(k, k - 1, w); // connect left
    } else if (k > leftBottomK && k < lastK) {
      // bottom
      g.addEdge(k, k - kx, w); // connect top
      g.addEdge(k, k + 1, w); // connect right
      g.addEdge(k, k - 1, w); // connect left
    } else if (k !== 0 && k !== leftBottomK && k % this.mapWidth === 0) {
      // left
      g.addEdge(k, k - kx, w); // connect top
      g.addEdge(k, k + 1, w); // connect right
      g.addEdge(k, k + kx, w); // connect bottom
    } else {
      g.addEdge(k, k - kx, w); // connect top
      g.addEdge(k, k + 1, w); // connect right
      g.addEdge(k, k + kx, w); // connect bottom
      g.addEdge(k, k - 1, w); // connect left
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
    this.drawTiles();
    this.redraw("exit");
    this.redraw("player");
  }

  drawPath() {
    const image = new Image();
    image.onload = () => {
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

const start = {x: 0, y: 0};
const exit = {x: 90, y: 180};

const b = new Board(start, exit);
b.draw();
window.addEventListener("resize", () => {
  const b = new Board(start, exit);
  b.draw();
  b.setDimensions();
  b.draw();
});
const gacha = document.getElementById("gacha");
gacha.addEventListener("click", () => {
  console.log(b.findPath());
});
