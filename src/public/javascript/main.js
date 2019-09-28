/* global annyang useSpeech isRolled mazeType useWeights mainHeight playerPos wallArr chosenPath pathSlots mapWidth slotAnimatingDone exitPos draw reset attackSignal pathDisplayed getCoords getPath lastKey monsterArr dijkstra aStar hp monstersPathMap g monsterMovementType helpPath searchFinished animatePath */
const moves = document.getElementById("moves");

// tutorial events
const tutorials = document.getElementById("tutorials");
const options = document.getElementById("options");
const tutorial = document.getElementById("tutorial");
const skip = document.getElementById("skip");
skip.addEventListener("click", () => {
  tutorials.style.display = "none";
});

const prev = document.getElementById("prev");
prev.addEventListener("click", () => {
  options.style.display = "flex";
  tutorial.style.display = "none";
  prev.style.display = "none";
  next.style.display = "block";
  skip.innerHTML = "Skip Tutorial";
});

const next = document.getElementById("next");
next.addEventListener("click", () => {
  options.style.display = "none";
  tutorial.style.display = "flex";
  prev.style.display = "block";
  next.style.display = "none";
  skip.innerHTML = "Close Tutorial";
});

// status events
const newGame = document.getElementById("new");
newGame.addEventListener("click", () => {
  // attackSignal = false;
  isRolled = false;
  reset(mazeType, useWeights);
});

const start = document.getElementById("start");
start.addEventListener("click", () => {
  attackSignal = true;
  const interval = setInterval(() => {
    if (attackSignal === false) {
      clearInterval(interval);
    }
    startMonstersAttack();
  }, delay);
});

const gacha = document.getElementById("gacha");
gacha.addEventListener("click", () => {
  if (!isRolled) {
    attackSignal = false;
    getChosenPath();
    slotC.style.visibility = "visible";
    animateSlot();
    txtToSpeech(`Rolling`);
    const slotInterval = setInterval(() => {
      if (slotAnimatingDone) {
        txtToSpeech(`You have rolled ${chosenPath}`);
        slotC.style.visibility = "hidden";
        clearInterval(slotInterval);
        helpPath = getPath();
        const pathInterval = setInterval(() => {
          if (searchFinished) {
            animatePath(helpPath);
            clearInterval(pathInterval);
          }
        }, 500);
      }
    }, 1000);
  } else {
    txtToSpeech(`You have already rolled ${chosenPath}`);
  }
  isRolled = true;
});

const recursiveLink = document.getElementById("recursive");
recursiveLink.addEventListener("click", () => {
  isRolled = false;
  mazeType = "recursive";
  reset(mazeType, useWeights);
});

const randomLink = document.getElementById("random");
randomLink.addEventListener("click", () => {
  isRolled = false;
  mazeType = "random";
  reset(mazeType, useWeights);
});

const mazeLink = document.getElementById("maze");
mazeLink.addEventListener("click", () => {
  isRolled = false;
  useWeights = false;
  reset(mazeType, useWeights);
});

const bombsLink = document.getElementById("bombs");
bombsLink.addEventListener("click", () => {
  isRolled = false;
  useWeights = true;
  reset(mazeType, useWeights);
});

const speechOnLink = document.getElementById("speechOn");
speechOnLink.addEventListener("click", () => {
  useSpeech = true;
  activateSpeech();
});

const speechOffLink = document.getElementById("speechOff");
speechOffLink.addEventListener("click", () => {
  useSpeech = false;
  activateSpeech();
});

// Slot events
const slotC = document.getElementById("slot");
const slotCtx = slotC.getContext("2d");
slotC.style.visibility = "hidden";

function animateSlot() {
  slotC.height = Math.floor(mainHeight * 0.2);
  slotC.width = window.innerWidth;
  const pathResult = chosenPath; // display random result
  const pathList = pathSlots; // display all possible paths
  // Font size and overall scale
  const scale = Math.floor(window.innerWidth * 0.06);
  const breaks = 0.003; // Speed loss per frame
  const endSpeed = 0.05; // Speed at which the text stops
  const numOfFrames = 220; // number of frames until text stops (60/s)
  // const delay = 40; // number of frames between texts
  const pathMap = [];
  let offsetV = endSpeed + breaks * numOfFrames;
  let offset = (-(1 + numOfFrames) * (breaks * numOfFrames + 2 * endSpeed)) / 2;

  for (let i = 0; i < pathList.length; i++) {
    pathMap[pathList[i]] = i;
  }
  function animate() {
    slotCtx.setTransform(1, 0, 0, 1, 0, 0);
    slotCtx.clearRect(0, 0, slotC.width, slotC.height);
    slotCtx.globalAlpha = 1;
    slotCtx.fillStyle = "#622";
    slotCtx.fillRect(0, (slotC.height - scale) / 2, slotC.width, scale);
    slotCtx.fillStyle = "#ccc";
    slotCtx.textBaseline = "middle";
    slotCtx.textAlign = "center";
    slotCtx.setTransform(
      1,
      0,
      0,
      1,
      Math.floor(slotC.width / 2),
      Math.floor(slotC.height / 2),
    );
    let o = offset;
    while (o < 0) o++; // ensure smooth spin stop
    o %= 1;
    const h = Math.ceil(slotC.height / 2 / scale);
    for (let j = -h; j < h; j++) {
      let c = pathMap[pathResult] + j - Math.floor(offset);
      while (c < 0) c += pathList.length;
      c %= pathList.length;
      const s = 1 - Math.abs(j + o) / (slotC.height / 2 / scale + 1);
      slotCtx.globalAlpha = s;
      slotCtx.font = scale * s + "px Helvetica";
      slotCtx.fillText(pathList[c], 0, (j + o) * scale);
    }
    offset += offsetV; // required for spining
    offsetV -= breaks; // required for slowing down spin
    if (offsetV < endSpeed) {
      // required for stopping spin
      offset = 0;
      offsetV = 0;
    }
    if (offset === 0 && offsetV === 0) slotAnimatingDone = true;
    requestAnimationFrame(animate);
  }
  animate();
}

// Keyboard presses events
function handleBlast(newPos) {
  if (wallArr[playerPos] === 5 && wallArr[newPos] === 1) {
    draw(playerPos, "blast");
  } else if (wallArr[playerPos] === 5 && wallArr[newPos] === 5) {
    draw(playerPos, "blast");
  } else draw(playerPos);
}

window.addEventListener("keydown", keyboardEvents);

function keyboardEvents(e) {
  switch (e.keyCode) {
    case 87:
    case 38:
      move("up");
      break;
    case 68:
    case 39:
      move("right");
      break;
    case 83:
    case 40:
      move("down");
      break;
    case 65:
    case 37:
      move("left");
      break;
    default:
      break;
  }
  if (playerPos === exitPos) {
    setTimeout(() => {
      alert("end game");
      reset(mazeType, useWeights);
      attackSignal = true;
    }, 200);
  }
}

function getNewPosition(type) {
  switch (type) {
    case "up":
      return playerPos - mapWidth;
    case "down":
      return playerPos + mapWidth;
    case "right":
      return playerPos + 1;
    case "left":
      return playerPos - 1;
    default:
      return undefined;
  }
}

function move(type) {
  const {x} = getCoords(playerPos);
  const newPos = getNewPosition(type);
  if (!useWeights && wallArr[newPos] === 5) {
    moves.innerHTML = Number(moves.innerHTML) + 1;
    return randomReply();
  } else if (useWeights && wallArr[newPos] === 5) {
    draw(newPos, "blast");
    randomReply();
  }
  switch (type) {
    case "up":
      if (playerPos >= mapWidth) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else {
        randomReply();
      }
      break;
    case "down":
      if (playerPos <= lastKey - mapWidth) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else {
        randomReply();
      }
      break;
    case "right":
      if (x < mapWidth - 1) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else randomReply();
      break;
    case "left":
      if (x > 0) {
        handleBlast(newPos);
        playerPos = newPos;
        draw(playerPos, "player");
      } else {
        randomReply();
      }
      break;
    default:
      randomReply();
  }
  if (!useWeights) {
    moves.innerHTML = Number(moves.innerHTML) + 1;
  } else {
    if (wallArr[Number(playerPos)] === 5) {
      moves.innerHTML = Number(moves.innerHTML) + 5;
    } else {
      moves.innerHTML = Number(moves.innerHTML) + 1;
    }
  }
}

// speech helper functions
function randomReply() {
  const repliesArr = useWeights === false ? mazeReplies() : bombsReplies();
  const randomNum = Math.floor(Math.random() * repliesArr.length);
  txtToSpeech(repliesArr[randomNum]);
}

// Text to speech events
function txtToSpeech(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "ja-JP";
  window.speechSynthesis.speak(msg);
}

function mazeReplies() {
  return [
    "Ouch!",
    "I can't go there!",
    "That hurts!",
    "Watch where you are going!",
    "You suck as this!",
    "I hate you!",
    "ばか!",
    "Stop driving me into the wall!",
    "You should be sent to a driving school!",
  ];
}

function bombsReplies() {
  return ["Ouch!", "Damn! It hurts!", "No!", "I hate you!", "Stop killing me!"];
}

// Voice command events
function commands() {
  // Define commands
  return {
    "move up": move("up"),
    "move up to end": function() {
      txtToSpeech("moving up.");
      for (let i = 0; i < mapHeight; i++) {
        (function(i) {
          setTimeout(() => {
            move("up");
          }, 300 * i);
        })(i);
      }
    },
    "move right": move("right"),
    "move right to end": function() {
      txtToSpeech("moving right.");
      for (let i = 0; i < mapWidth; i++) {
        (function(i) {
          setTimeout(() => {
            move("right");
          }, 300 * i);
        })(i);
      }
    },
    "move down": move("down"),
    "move down to end": function() {
      txtToSpeech("moving down.");
      for (let i = 0; i < mapHeight; i++) {
        (function(i) {
          setTimeout(() => {
            move("down");
          }, 300 * i);
        })(i);
      }
    },
    "move left": move("left"),
    "move left to end": function() {
      txtToSpeech("moving left.");
      for (let i = 0; i < mapWidth; i++) {
        (function(i) {
          setTimeout(() => {
            move("left");
          }, 300 * i);
        })(i);
      }
    },
    "new game": function() {
      attackSignal = false;
      isRolled = false;
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "help": function() {
      if (!isRolled) {
        attackSignal = false;
        getChosenPath();
        slotC.style.visibility = "visible";
        animateSlot();
        txtToSpeech(`Rolling`);
        const slotInterval = setInterval(() => {
          if (slotAnimatingDone) {
            txtToSpeech(`You have rolled ${chosenPath}`);
            slotC.style.visibility = "hidden";
            clearInterval(slotInterval);
            helpPath = getPath();
            const pathInterval = setInterval(() => {
              if (searchFinished) {
                pathDisplayed = true;
                animatePath(helpPath);
                clearInterval(pathInterval);
              }
            }, 500);
          }
        }, 1000);
      } else {
        txtToSpeech(`You have already rolled ${chosenPath}`);
      }
      isRolled = true;
    },
    "end game": function() {
      if (pathDisplayed === true) {
        const path = getPath(false);
        for (let i = 0; i < path.length; i++) {
          (function(i) {
            setTimeout(() => {
              draw(playerPos);
              playerPos = path[i];
              draw(playerPos, "player");
              if (Number(playerPos) === exitPos) {
                setTimeout(() => {
                  alert("end game");
                  reset(mazeType, useWeights);
                }, 200);
              }
            }, 300 * i);
          })(i);
        }
      } else {
        txtToSpeech("No cheating allowed.");
      }
    },
    "activate recursive maze": function() {
      isRolled = false;
      attackSignal = false;
      mazeType = "recursive";
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "activate random maze": function() {
      isRolled = false;
      attackSignal = false;
      mazeType = "random";
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "activate bombs mode": function() {
      isRolled = false;
      attackSignal = false;
      useWeights = true;
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "activate maze mode": function() {
      isRolled = false;
      attackSignal = false;
      useWeights = false;
      reset(mazeType, useWeights);
      attackSignal = true;
    },
    "deactivate voice mode": function() {
      useSpeech = false;
      activateSpeech();
      txtToSpeech("Voice mode deactivated.");
    },
  };
}

function activateSpeech() {
  if (useSpeech) {
    if (annyang) {
      txtToSpeech("Voice mode activated. Please give your command.");

      // Add commands to annyang
      annyang.addCommands(commands());

      // Start listening.
      annyang.start({paused: false});

      annyang.addCallback("soundstart", function() {
        console.log("sound detected");
      });
    } else {
      annyang.abort();
    }
  }
}

function getChosenPath() {
  const num = Math.floor(Math.random() * pathSlots.length);
  chosenPath = pathSlots[num];
  return chosenPath;
}

function getPath(animate = true) {
  return findPath(playerPos, exitPos, g, animate);
}

function findPath(start, _exit, g, animate = true) {
  start = String(start);
  const exit = _exit === undefined ? String(exitPos) : String(_exit);
  let path;
  switch (chosenPath) {
    case "dijkstra":
      path = dijkstra(start, exit, g, animate);
      break;
    case "a star":
      path = aStar(start, exit, g, animate);
      break;
    // case "breath first search":
    //   return breathFirstSearch(start, exit, g);
    //   break;
    // case "depth first search":
    //   return depthFirstSearch(start, exit, g, animateOff);
    default:
      break;
  }
  return path;
}

function startMonstersAttack() {
  // loop through each monster
  for (let i = 0; i < monsterArr.length; i++) {
    // allow each monster to use different path algorithm
    monsterMovementType = getChosenPath();
    const start = monsterArr[i];
    // check if any path been searched for monsters
    if (Object.entries(monstersPathMap).length === 0) {
      monstersPathMap[i] = findPath(start, playerPos, g, false).reverse();
      monstersPathMap[i].pop();
      // check if next monster path has been searched
    } else if (monstersPathMap[i] === undefined) {
      monstersPathMap[i] = findPath(start, playerPos, g, false).reverse();
      monstersPathMap[i].pop();
    }
    // check if a monster path has finished
    if (monstersPathMap[i].length === 0) {
      monstersPathMap[i] = findPath(start, playerPos, g, false).reverse();
      monstersPathMap[i].pop();
    }
    draw(monsterArr[i]);
    monsterArr[i] = monstersPathMap[i].pop();
    draw(start, "floor");
    draw(monsterArr[i], "monster");
    if (monsterArr[i] === String(playerPos)) {
      document.getElementById(`hp${hp}`).style.visibility = "hidden";
      hp -= 1;
      if (hp <= 0) {
        alert("GAME OVER!");
        reset(mazeType, useWeights);
      }
    }
  }
}

reset("random", false);
window.addEventListener("resize", () => {
  reset(mazeType, useWeights);
});
