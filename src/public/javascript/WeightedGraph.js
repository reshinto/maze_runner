/* global PriorityQueue */

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

  dijkstra(exit, start) {
    let currentKey;
    if (start !== undefined) {
      this.start = start;
      this.drawGraph();
    }
    if (this.searched) this.drawGraph();
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        break;
      }
      if (currentKey || this.distances[currentKey] !== Infinity) {
        for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
          const nextNode = this.adjacencyList[currentKey][i];
          const newDistance = this.distances[currentKey] + nextNode.weight;
          const nextNeighbor = nextNode.node;
          if (newDistance < this.distances[nextNode.node]) {
            this.distances[nextNeighbor] = newDistance;
            this.previous[nextNeighbor] = currentKey;
            this.pq.enqueue(
              nextNeighbor,
              newDistance,
              this.vertexList[currentKey],
            );
          }
        }
      }
    }
    this.searched = true;
    return this.path.concat(currentKey).reverse();
  }

  manhattanDistance(exit, start) {
    return Math.abs(this.start.x - exit.x) + Math.abs(this.start.y - exit.y);
  }

  aStar(exit, start) {
    let currentKey;
    if (start !== undefined) {
      this.start = start;
      this.drawGraph();
    }
    if (this.searched) this.drawGraph();
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        break;
      }
      if (currentKey || this.distances[currentKey] !== Infinity) {
        for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
          const nextNode = this.adjacencyList[currentKey][i];
          const newDistance =
            this.distances[currentKey] +
            this.manhattanDistance(exit, this.start);
          const nextNeighbor = nextNode.node;
          if (newDistance < this.distances[nextNode.node]) {
            this.distances[nextNeighbor] = newDistance;
            this.previous[nextNeighbor] = currentKey;
            this.pq.enqueue(
              nextNeighbor,
              newDistance,
              this.vertexList[currentKey],
            );
          }
        }
      }
    }
    this.searched = true;
    return this.path.concat(currentKey).reverse();
  }

  breathFirstSearch(exit, start) {
    let currentKey;
    if (start !== undefined) {
      this.start = start;
      this.drawGraph();
    }
    if (this.searched) this.drawGraph();
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        break;
      }
      if (currentKey || this.distances[currentKey] !== Infinity) {
        for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
          const nextNode = this.adjacencyList[currentKey][i];
          const newDistance = this.distances[currentKey];
          const nextNeighbor = nextNode.node;
          if (newDistance < this.distances[nextNode.node]) {
            this.distances[nextNeighbor] = newDistance;
            this.previous[nextNeighbor] = currentKey;
            this.pq.enqueue(
              nextNeighbor,
              newDistance,
              this.vertexList[currentKey],
            );
          }
        }
      }
    }
    this.searched = true;
    return this.path.concat(currentKey).reverse();
  }
}
