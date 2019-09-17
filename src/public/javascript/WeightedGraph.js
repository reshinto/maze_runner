/* global getCoords PriorityQueue */

class WeightedGraph {
  constructor(ctx, start, mapWidth, tileWidth, monsterList) {
    this.ctx = ctx;
    this.vertexList = [];
    this.adjacencyList = {};
    this.start = start;
    this.key = 0;
    this.mapWidth = mapWidth;
    this.tileWidth = tileWidth;
    this.monsterList = monsterList;
    this.isAnimating = false;
  }

  resetGraph() {
    this.pq = new PriorityQueue();
    this.distances = {};
    this.previous = {};
    this.path = [];
    this.searched = false;
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

  drawGraph(start) {
    this.resetGraph();
    Object.keys(this.adjacencyList).forEach((key) => {
      if (
        this.vertexList[key]["coords"].x === start.x &&
        this.vertexList[key]["coords"].y === start.y
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

  animatePath(tempCtx, displayPath) {
    for (let i = 1; i < displayPath.length - 1; i++) {
      const temp = this.vertexList[displayPath[i]].coords;
      if (this.vertexList[displayPath[i]].wall === 1) {
        (function(i) {
          setTimeout(() => redraw("path", tempCtx, temp), 20 * i);
        })(i);
      }
    }
  }

  // player and monster algorithms are kept separate to prevent clashes
  dijkstra(exit, start, animateOff=false) {
    if (this.searched || start !== undefined) this.drawGraph(start);
    this.isAnimating = true;
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1 && !animateOff) {
        const temp = this.vertexList[currentKey].coords;
        (function(_) {
          setTimeout(() => {
            if (temp.x === exit.x && temp.y === exit.y) {
              isAnimating = false;
            } else {
              redraw("search", tempCtx, temp);
            }
          }, 20 * _);
        })(_);
      }
      _++;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        this.searched = true;
        break;
      }
      if (this.distances[currentKey] !== Infinity) {
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
    const displayPath = this.path.concat(currentKey).reverse();
    if (animateOff) {
      isAnimating = false;
    }
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.isAnimating = false;
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    return displayPath;
  }

  dijkstraMonster(exit, start) {
    if (!this.isAnimating) {
      const pq = new PriorityQueue();
      const distances = {};
      const previous = {};
      let currentKey;
      const path = [];
      Object.keys(this.adjacencyList).forEach((key) => {
        if (
          this.vertexList[key]["coords"].x === start.x &&
          this.vertexList[key]["coords"].y === start.y
        ) {
          distances[key] = 0;
          pq.enqueue(key, 0, this.vertexList[key]);
        } else {
          distances[key] = Infinity;
          pq.enqueue(key, Infinity, this.vertexList[key]);
        }
        previous[key] = null;
      });
      while (pq.values.length) {
        const currentNode = pq.dequeue();
        currentKey = currentNode.key;
        if (
          this.vertexList[currentKey].coords.x === exit.x &&
          this.vertexList[currentKey].coords.y === exit.y
        ) {
          while (previous[currentKey]) {
            path.push(currentKey);
            currentKey = previous[currentKey];
          }
          break;
        }
        if (distances[currentKey] !== Infinity) {
          for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
            const nextNode = this.adjacencyList[currentKey][i];
            const newDistance = distances[currentKey] + nextNode.weight;
            const nextNeighbor = nextNode.node;
            if (newDistance < distances[nextNode.node]) {
              distances[nextNeighbor] = newDistance;
              previous[nextNeighbor] = currentKey;
              pq.enqueue(
                nextNeighbor,
                newDistance,
                this.vertexList[currentKey],
              );
            }
          }
        }
      }
      return path;
    }
    return [start];
  }

  manhattanDistance(exit, start) {
    return Math.abs(start.x - exit.x) + Math.abs(start.y - exit.y);
  }

  aStar(exit, start, animateOff=false) {
    if (this.searched || start !== undefined) this.drawGraph(start);
    this.isAnimating = true;
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1 && !animateOff) {
        const temp = this.vertexList[currentKey].coords;
        (function(_) {
          setTimeout(() => {
            if (temp.x === exit.x && temp.y === exit.y) {
              isAnimating = false;
            } else {
              redraw("search", tempCtx, temp);
            }
          }, 20 * _);
        })(_);
      }
      _++;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        this.searched = true;
        break;
      }
      if (this.distances[currentKey] !== Infinity) {
        for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
          const nextNode = this.adjacencyList[currentKey][i];
          const newDistance =
            this.distances[currentKey] +
            nextNode.weight +
            this.manhattanDistance(
              exit,
              getCoords(nextNode.node, this.mapWidth, this.tileWidth),
            );
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
    const displayPath = this.path.concat(currentKey).reverse();
    if (animateOff) {
      isAnimating = false;
    }
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.isAnimating = false;
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    return displayPath;
  }

  aStarMonster(exit, start) {
    if (!this.isAnimating) {
      const pq = new PriorityQueue();
      const distances = {};
      const previous = {};
      let currentKey;
      const path = [];
      Object.keys(this.adjacencyList).forEach((key) => {
        if (
          this.vertexList[key]["coords"].x === start.x &&
          this.vertexList[key]["coords"].y === start.y
        ) {
          distances[key] = 0;
          pq.enqueue(key, 0, this.vertexList[key]);
        } else {
          distances[key] = Infinity;
          pq.enqueue(key, Infinity, this.vertexList[key]);
        }
        previous[key] = null;
      });
      while (pq.values.length) {
        const currentNode = pq.dequeue();
        currentKey = currentNode.key;
        if (
          this.vertexList[currentKey].coords.x === exit.x &&
          this.vertexList[currentKey].coords.y === exit.y
        ) {
          while (previous[currentKey]) {
            path.push(currentKey);
            currentKey = previous[currentKey];
          }
          break;
        }
        if (distances[currentKey] !== Infinity) {
          for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
            const nextNode = this.adjacencyList[currentKey][i];
            const newDistance =
              distances[currentKey] +
              nextNode.weight +
              this.manhattanDistance(
                exit,
                getCoords(nextNode.node, this.mapWidth, this.tileWidth),
              );
            const nextNeighbor = nextNode.node;
            if (newDistance < distances[nextNode.node]) {
              distances[nextNeighbor] = newDistance;
              previous[nextNeighbor] = currentKey;
              pq.enqueue(
                nextNeighbor,
                newDistance,
                this.vertexList[currentKey],
              );
            }
          }
        }
      }
      return path;
    }
    return [start];
  }

  // TODO: does not seems to be working properly
  breathFirstSearch(exit, start, animateOff=false) {
    if (this.searched || start !== undefined) this.drawGraph(start);
    this.isAnimating = true;
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1 && !animateOff) {
        const temp = this.vertexList[currentKey].coords;
        (function(_) {
          setTimeout(() => {
            if (temp.x === exit.x && temp.y === exit.y) {
              isAnimating = false;
            } else {
              redraw("search", tempCtx, temp);
            }
          }, 20 * _);
        })(_);
      }
      _++;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        this.searched = true;
        break;
      }
      if (this.distances[currentKey] !== Infinity) {
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
    const displayPath = this.path.concat(currentKey).reverse();
    if (animateOff) {
      isAnimating = false;
    }
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.isAnimating = false;
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    return displayPath;
  }

  // TODO: does not seems to be working properly
  breathFirstSearchMonster(exit, start) {
    if (!this.isAnimating) {
      const pq = new PriorityQueue();
      const distances = {};
      const previous = {};
      let currentKey;
      const path = [];
      Object.keys(this.adjacencyList).forEach((key) => {
        if (
          this.vertexList[key]["coords"].x === start.x &&
          this.vertexList[key]["coords"].y === start.y
        ) {
          distances[key] = 0;
          pq.enqueue(key, 0, this.vertexList[key]);
        } else {
          distances[key] = Infinity;
          pq.enqueue(key, Infinity, this.vertexList[key]);
        }
        previous[key] = null;
      });
      while (pq.values.length) {
        const currentNode = pq.dequeue();
        currentKey = currentNode.key;
        if (
          this.vertexList[currentKey].coords.x === exit.x &&
          this.vertexList[currentKey].coords.y === exit.y
        ) {
          while (previous[currentKey]) {
            path.push(currentKey);
            currentKey = previous[currentKey];
          }
          break;
        }
        if (distances[currentKey] !== Infinity) {
          for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
            const nextNode = this.adjacencyList[currentKey][i];
            const newDistance = distances[currentKey];
            const nextNeighbor = nextNode.node;
            if (newDistance < distances[nextNode.node]) {
              distances[nextNeighbor] = newDistance;
              previous[nextNeighbor] = currentKey;
              pq.enqueue(
                nextNeighbor,
                newDistance,
                this.vertexList[currentKey],
              );
            }
          }
        }
      }
      return path;
    }
    return [start];
  }

  // TODO: Not working
  depthFirstSearch(exit, start, animateOff=false) {
    if (this.searched || start !== undefined) this.drawGraph(start);
    this.isAnimating = true;
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1 && !animateOff) {
        const temp = this.vertexList[currentKey].coords;
        (function(_) {
          setTimeout(() => {
            if (temp.x === exit.x && temp.y === exit.y) {
              isAnimating = false;
            } else {
              redraw("search", tempCtx, temp);
            }
          }, 20 * _);
        })(_);
      }
      _++;
      if (
        this.vertexList[currentKey].coords.x === exit.x &&
        this.vertexList[currentKey].coords.y === exit.y
      ) {
        while (this.previous[currentKey]) {
          this.path.push(currentKey);
          currentKey = this.previous[currentKey];
        }
        this.searched = true;
        break;
      }
      if (this.distances[currentKey] !== Infinity) {
        for (let i = 0; i < this.adjacencyList.length; i++) {
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
    const displayPath = this.path.concat(currentKey).reverse();
    if (animateOff) {
      isAnimating = false;
    }
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.isAnimating = false;
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    console.log(displayPath);
    return displayPath;
  }
}

function redraw(type, ctx, start, monsterList) {
  let file;
  const image = new Image();
  switch (type) {
    case "wall":
      file = "/images/wall.png";
      break;
    case "player":
      file = "/images/start.png";
      image.onload = () => {
        ctx.drawImage(image, start.x, start.y);
      };
      break;
    case "floor":
      file = "/images/floor.png";
      image.onload = () => {
        ctx.drawImage(image, start.x, start.y);
      };
      break;
    case "search":
      file = "/images/searched.png";
      image.onload = () => {
        ctx.drawImage(image, start.x, start.y);
      };
      break;
    case "blast":
      file = "/images/blast.png";
      image.onload = () => {
        ctx.drawImage(image, start.x, start.y);
      };
      break;
    case "path":
      file = "/images/path.png";
      image.onload = () => {
        ctx.drawImage(image, start.x, start.y);
      };
      break;
    case "monster":
      file = "/images/monster.png";
      image.onload = () => {
        for (let i = 0; i < monsterList.length; i++) {
          ctx.drawImage(
            image,
            monsterList[i][`monster${i}`].x,
            monsterList[i][`monster${i}`].y,
          );
        }
      };
      break;
    default:
      break;
  }
  image.src = file;
}
