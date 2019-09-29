/* global wallArr PriorityQueue getCoords tileSize draw exitPos searchFinished */

class WeightedGraph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    const key = String(vertex);
    if (!this.adjacencyList[key]) this.adjacencyList[key] = [];
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
    if (wallArr[k1] === 1 && wallArr[k2] === 1) {
      this._addEdge(k1, k2, weight);
    }
  }

  _addWeightEdge(k1, k2, weight) {
    if (wallArr[k1] > wallArr[k2]) {
      weight = wallArr[k1];
    } else if (wallArr[k2] > wallArr[k1]) {
      weight = wallArr[k2];
    }
    if (k2 !== -1) {
      this._addEdge(k1, k2, weight);
    }
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
}

function animateSearch(currentPos, count) {
  if (count > 0 && wallArr[currentPos] === 1) {
    (function(count) {
      setTimeout(() => {
        if (Number(currentPos) !== exitPos) {
          draw(currentPos, "search");
        } else {
          searchFinished = true;
        }
      }, 20 * count);
    })(count);
  }
}

function animatePath(path) {
  // path does not include current position
  // current position was removed in the search algorithms
  for (let i=1; i<path.length-1; i++) {
    (function(i) {
      setTimeout(() => draw(path[i], "path"), 50 * i);
    })(i);
  }
}

function dijkstra(start, finish, g, animate=true) {
  const nodes = new PriorityQueue();
  const distances = {};
  const previous = {};
  let path = []; // to return at end
  let smallest;
  let animationCount = 0;

  // build up initial state
  Object.keys(g.adjacencyList).forEach(function(vertex) {
    // for (const vertex in this.adjacencyList) {
    if (vertex === start) {
      distances[vertex] = 0;
      nodes.enqueue(vertex, 0);
    } else {
      distances[vertex] = Infinity;
      nodes.enqueue(vertex, Infinity);
    }
    previous[vertex] = null;
  });
  // }

  // as long as there is something to visit
  while (nodes.values.length) {
    smallest = nodes.dequeue().value;
    if (animate === true) {
      animateSearch(smallest, animationCount);
      animationCount++;
    }
    if (smallest === finish) {
      // we are done, build up path to return at end
      while (previous[smallest]) {
        path.push(smallest);
        smallest = previous[smallest];
      }
      break;
    }
    if (smallest || distances[smallest] !== Infinity) {
      // i = neighbor
      for (let i = 0; i < g.adjacencyList[smallest].length; i++) {
        // find neighboring node
        const nextNode = g.adjacencyList[smallest][i];
        // calculate new distance to neighboring node
        const candidate = distances[smallest] + nextNode.weight;
        const nextNeighbor = nextNode.node;
        if (candidate < distances[nextNode.node]) {
          // updating new smallest distance to neighbor
          distances[nextNeighbor] = candidate;
          // updating previous - how we got to neighbor
          previous[nextNeighbor] = smallest;
          // enqueue in priority queue with new priority
          nodes.enqueue(nextNeighbor, candidate);
        }
      }
    }
  }
  path = path.concat(smallest).reverse();
  return path;
}

function manhattanDistance(_start, _finish) {
  const start = getCoords(Number(_start), tileSize);
  const finish = getCoords(Number(_finish), tileSize);
  return Math.abs(start.x - finish.x) + Math.abs(start.y - finish.y);
}

function aStar(start, finish, g, animate=true) {
  const nodes = new PriorityQueue();
  const distances = {};
  const previous = {};
  let path = []; // to return at end
  let smallest;
  let animationCount = 0;

  // build up initial state
  Object.keys(g.adjacencyList).forEach(function(vertex) {
    // for (const vertex in this.adjacencyList) {
    if (vertex === start) {
      distances[vertex] = 0;
      nodes.enqueue(vertex, 0);
    } else {
      distances[vertex] = Infinity;
      nodes.enqueue(vertex, Infinity);
    }
    previous[vertex] = null;
  });
  // }

  // as long as there is something to visit
  while (nodes.values.length) {
    smallest = nodes.dequeue().value;
    if (animate === true) {
      animateSearch(smallest, animationCount);
      animationCount++;
    }
    if (smallest === finish) {
      // we are done, build up path to return at end
      while (previous[smallest]) {
        path.push(smallest);
        smallest = previous[smallest];
      }
      break;
    }
    if (smallest || distances[smallest] !== Infinity) {
      // i = neighbor
      for (let i = 0; i < g.adjacencyList[smallest].length; i++) {
        // find neighboring node
        const nextNode = g.adjacencyList[smallest][i];
        // calculate new distance to neighboring node
        const candidate =
          distances[smallest] +
          nextNode.weight +
          manhattanDistance(nextNode.node, finish);
        const nextNeighbor = nextNode.node;
        if (candidate < distances[nextNode.node]) {
          // updating new smallest distance to neighbor
          distances[nextNeighbor] = candidate;
          // updating previous - how we got to neighbor
          previous[nextNeighbor] = smallest;
          // enqueue in priority queue with new priority
          nodes.enqueue(nextNeighbor, candidate);
        }
      }
    }
  }
  path = path.concat(smallest).reverse();
  return path;
}
