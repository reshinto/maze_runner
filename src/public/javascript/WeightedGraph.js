/* global getCoords PriorityQueue */

class WeightedGraph {
  constructor(ctx, start, mapWidth, tileWidth) {
    this.ctx = ctx;
    this.vertexList = [];
    this.adjacencyList = {};
    this.start = start;
    this.key = 0;
    this.mapWidth = mapWidth;
    this.tileWidth = tileWidth;
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

  dijkstra(exit, start) {
    if (this.searched) this.drawGraph();
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1) {
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
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    return this.path;
  }

  manhattanDistance(exit, start) {
    return Math.abs(start.x - exit.x) + Math.abs(start.y - exit.y);
  }

  aStar(exit, start) {
    if (this.searched) this.drawGraph();
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1) {
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
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    return this.path;
  }

  breathFirstSearch(exit, start) {
    if (this.searched) this.drawGraph();
    let currentKey;
    let isAnimating;
    let _ = 0;
    const tempCtx = this.ctx;
    while (this.pq.values.length) {
      const currentNode = this.pq.dequeue();
      currentKey = currentNode.key;
      // skip starting node, all walls, and all bombs
      if (_ > 0 && this.vertexList[currentKey].wall === 1) {
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
    const interval = setInterval(() => {
      if (isAnimating === false) {
        this.animatePath(tempCtx, displayPath);
        clearInterval(interval);
      }
    }, 0);
    return this.path;
  }

  // depthFirstSearch(exit, start) {
  //   if (this.searched) this.drawGraph();
  //   let currentKey;
  //   let isAnimating;
  //   let _ = 0;
  //   const tempCtx = this.ctx;
  //   while (this.pq.values.length) {
  //     const currentNode = this.pq.dequeue();
  //     currentKey = currentNode.key;
  //     console.log("top", currentKey);
  //     console.log(this.distances[currentKey]);
  //     // skip starting node, all walls, and all bombs
  //     if (_ > 0 && this.vertexList[currentKey].wall === 1) {
  //       const temp = this.vertexList[currentKey].coords;
  //       (function(_) {
  //         setTimeout(() => {
  //           if (temp.x === exit.x && temp.y === exit.y) {
  //             isAnimating = false;
  //           } else {
  //             redraw("search", tempCtx, temp);
  //           }
  //         }, 20 * _);
  //       })(_);
  //     }
  //     _++;
  //     if (
  //       this.vertexList[currentKey].coords.x === exit.x &&
  //       this.vertexList[currentKey].coords.y === exit.y
  //     ) {
  //       while (this.previous[currentKey]) {
  //         this.path.push(currentKey);
  //         currentKey = this.previous[currentKey];
  //       }
  //       this.searched = true;
  //       break;
  //     }
  //     if (this.distances[currentKey] !== Infinity) {
  //       console.log("bottom", currentKey);
  //       for (let i = 0; i < this.adjacencyList[currentKey].length; i++) {
  //         const nextNode = this.adjacencyList[currentKey][i];
  //         const newDistance = this.distances[currentKey];
  //         const nextNeighbor = nextNode.node;
  //         if (newDistance < this.distances[nextNode.node]) {
  //           this.distances[nextNeighbor] = newDistance;
  //           this.previous[nextNeighbor] = currentKey;
  //           this.pq.enqueue(
  //             nextNeighbor,
  //             newDistance,
  //             this.vertexList[currentKey],
  //           );
  //         }
  //       }
  //     }
  //   }
  //   const displayPath = this.path.concat(currentKey).reverse();
  //   console.log(this.path);
  //   const interval = setInterval(() => {
  //     if (isAnimating === false) {
  //       this.animatePath(tempCtx, displayPath);
  //       clearInterval(interval);
  //     }
  //   }, 0);
  //   return this.path;
  // }
}

function redraw(type, ctx, start) {
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
      file = "/images/floor2.png";
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
    default:
      break;
  }
  image.src = file;
}
