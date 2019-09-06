class Node {
  constructor(vertex, weight) {
    this.vertex = vertex;
    this.weight = weight;
    this.floorImg = "/images/floor2.png";
    const image = new Image();
    image.onload = () => {
      vertex.ctx.drawImage(image, vertex.coords.x, vertex.coords.y);
    };
    image.src = this.floorImg;
  }
}

class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(vertex, weight) {
    const newNode = new Node(vertex, weight);
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
    this.size = [];
    this.adjacencyList = {};
    this.newFloorImg = "/images/floor.png";
    this.pq = new PriorityQueue();
    this.distances = {};
    this.previous = {};
    this.path = [];
    this.smallest = undefined;
    this.start = start;
  }

  addVertex(vertex) {
    const key = vertex.key;
    if (!this.adjacencyList[key]) {
      this.adjacencyList[key] = vertex;
      this.adjacencyList[key]["edge"] = [];
      this.size.push(vertex);
    }
  }

  addEdge(k1, k2, weight) {
    this.adjacencyList[k1]["edge"].push({
      node: this.adjacencyList[k2],
      weight,
    });
    this.adjacencyList[k2]["edge"].push({
      node: this.adjacencyList[k1],
      weight,
    });
  }

  drawGraph() {
    let vertex;
    Object.keys(this.adjacencyList).forEach((key) => {
      vertex = this.adjacencyList[key];
      if (
        this.adjacencyList[key]["coords"].x === this.start.x &&
        this.adjacencyList[key]["coords"].y === this.start.y
      ) {
        this.distances[vertex.key] = 0;
        this.pq.enqueue(vertex, 0);
      } else {
        this.distances[vertex.key] = Infinity;
        this.pq.enqueue(vertex, Infinity);
      }
      this.previous[vertex.key] = null;
    });
  }

  dijkstra(finish) {
    while (this.pq.values.length) {
      this.smallest = this.pq.dequeue();
      if (
        this.smallest.vertex.coords.x === finish.x &&
        this.smallest.vertex.coords.y === finish.y
      ) {
        while (this.previous[this.smallest.vertex.key]) {
          this.smallest.floorImg = this.newFloorImg;
          this.path.push(this.smallest.vertex.coords);
          this.smallest.vertex = this.previous[this.smallest.vertex.key];
        }
        break;
      }
      if (
        this.smallest.vertex ||
        this.distances[this.smallest.vertex.key] !== Infinity
      ) {
        for (
          let i = 0;
          i < this.adjacencyList[this.smallest.vertex.key]["edge"].length;
          i++
        ) {
          const nextNode = this.adjacencyList[this.smallest.vertex.key]["edge"][
            i
          ];
          const candidate =
            this.distances[this.smallest.vertex.key] + nextNode.weight;
          const nextNeighbor = nextNode.node;
          if (candidate < this.distances[nextNode.node.key]) {
            this.distances[nextNeighbor.key] = candidate;
            this.previous[nextNeighbor.key] = this.smallest.vertex;
            this.pq.enqueue(nextNeighbor, candidate);
          }
        }
      }
    }
    this.smallest.floorImg = this.newFloorImg;
    return this.path.concat(this.smallest.vertex.coords).reverse();
  }
}

class Board {
  constructor() {
    this.setDimensions();
    this.start = {x: 0, y: 0};
    this.exit = {x: 90, y: 90};
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
    let key = 0;
    let vertex;
    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        vertex = {
          key,
          ctx: this.ctx,
          coords: {x: j * this.tileWidth, y: i * this.tileHeight},
        };
        g.addVertex(vertex);
        key++;
      }
    }
    key = 0;
    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        this.addConnections(g, key, j * this.tileWidth, i * this.tileHeight, 1);
        key++;
      }
    }
    g.drawGraph();
  }

  addConnections(g, key, xValue, yValue, w) {
    const ky = this.mapHeight;
    const x = xValue;
    const y = yValue;
    const k = key;
    const xn = (this.mapWidth - 1) * this.tileWidth;
    const yn = (this.mapHeight - 1) * this.tileHeight;
    if (x === 0 && y === 0) {
      // top left
      g.addEdge(k, k + 1, w);
      g.addEdge(k, k + ky, w);
    } else if (x === xn && y === 0) {
      // top right
      g.addEdge(k, k + ky, w);
      g.addEdge(k, k - 1, w);
    } else if (x === xn && y === yn) {
      // bottom right
      g.addEdge(k, k - ky, w);
      g.addEdge(k, k - 1, w);
    } else if (x === 0 && y === yn) {
      // bottom left
      g.addEdge(k, k - ky, w);
      g.addEdge(k, k + 1, w);
    } else if (y === 0 && x !== 0 && x !== xn) {
      // top
      g.addEdge(k, k + 1, w);
      g.addEdge(k, k + ky, w);
      g.addEdge(k, k - 1, w);
    } else if (x === xn && y !== 0 && y !== yn) {
      // right
      g.addEdge(k, k - ky, w);
      g.addEdge(k, k + ky, w);
      g.addEdge(k, k - 1, w);
    } else if (y === yn && x !== 0 && x !== xn) {
      // bottom
      g.addEdge(k, k - ky, w);
      g.addEdge(k, k + 1, w);
      g.addEdge(k, k - 1, w);
    } else if (x === 0 && y !== 0 && y !== yn) {
      // left
      g.addEdge(k, k - ky, w);
      g.addEdge(k, k + 1, w);
      g.addEdge(k, k + ky, w);
    } else {
      g.addEdge(k, k - ky, w);
      g.addEdge(k, k + 1, w);
      g.addEdge(k, k + ky, w);
      g.addEdge(k, k - 1, w);
    }
  }

  findPath() {
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

  drawPlayer() {
    this.redraw("player");
  }

  drawExit() {
    this.redraw("exit");
  }

  draw() {
    Promise.all([
      this.drawTiles(),
      this.drawExit(),
      this.drawPlayer(),
    ]);
  }

  drawPath() {
    const image = new Image();
    image.onload = () => {
      for (let i = 1; i < this.path.length - 1; i++) {
        this.ctx.drawImage(image, this.path[i].x, this.path[i].y);
      }
    };
    image.src = "/images/path.png";
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

const b = new Board();
b.draw();
window.addEventListener("resize", () => {
  b.setDimensions();
  b.draw();
});
const gacha = document.getElementById("gacha");
gacha.addEventListener("click", () => {
  console.log(b.findPath());
});
