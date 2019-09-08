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
