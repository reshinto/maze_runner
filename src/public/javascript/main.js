/* global annyang Board */

(function() {
  let startKey;
  let exitKey;
  let mazeType = "random";
  let useWeights = false;
  let useSpeech = false;

  const b = new Board(startKey, exitKey, mazeType, useWeights);
  window.addEventListener("resize", () => {
    b.reset(startKey, exitKey, mazeType, useWeights);
  });

  const newGame = document.getElementById("new");
  newGame.addEventListener("click", () => {
    b.reset(startKey, exitKey, mazeType, useWeights);
  });

  const gacha = document.getElementById("gacha");
  gacha.addEventListener("click", () => {
    b.findPath(b.start);
  });

  const recursiveLink = document.getElementById("recursive");
  recursiveLink.addEventListener("click", () => {
    mazeType = "recursive";
    b.reset(startKey, exitKey, mazeType, useWeights);
  });

  const randomLink = document.getElementById("random");
  randomLink.addEventListener("click", () => {
    mazeType = "random";
    b.reset(startKey, exitKey, mazeType, useWeights);
  });

  const mazeLink = document.getElementById("maze");
  mazeLink.addEventListener("click", () => {
    useWeights = false;
    b.reset(startKey, exitKey, mazeType, useWeights);
  });

  const bombsLink = document.getElementById("bombs");
  bombsLink.addEventListener("click", () => {
    useWeights = true;
    b.reset(startKey, exitKey, mazeType, useWeights);
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

  window.addEventListener("keydown", keyboardEvents);

  function keyboardEvents(e) {
    switch (e.keyCode) {
      case 87:
      case 38:
        up();
        break;
      case 68:
      case 39:
        right();
        break;
      case 83:
      case 40:
        down();
        break;
      case 65:
      case 37:
        left();
        break;
      default:
        break;
    }
    if (b.startKey === b.exitKey) {
      setTimeout(() => {
        alert("end game");
        b.reset(startKey, exitKey, mazeType, useWeights);
      }, 200);
    }
  }

  function up() {
    if (b.start.y > 0) {
      b.redraw("player", -b.mapWidth);
    } else {
      b.randomReply();
    }
  }

  function right() {
    if (b.start.x < b.mapWidth * b.tileWidth - b.tileWidth) {
      b.redraw("player", 1);
    } else {
      b.randomReply();
    }
  }

  function down() {
    if (b.start.y < b.mapHeight * b.tileHeight - b.tileHeight) {
      b.redraw("player", +b.mapWidth);
    } else {
      b.randomReply();
    }
  }

  function left() {
    if (b.start.x > 0) {
      b.redraw("player", -1);
    } else {
      b.randomReply();
    }
  }

  function txtToSpeech(text) {
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
  }

  function commands() {
    // Define commands
    return {
      "move up": up,
      "move up to end": function() {
        txtToSpeech("moving up.");
        for (let i = 0; i < b.mapHeight; i++) {
          (function(i) {
            setTimeout(() => {
              up();
            }, 300 * i);
          })(i);
        }
      },
      "move right": right,
      "move right to end": function() {
        txtToSpeech("moving right.");
        for (let i = 0; i < b.mapWidth; i++) {
          (function(i) {
            setTimeout(() => {
              right();
            }, 300 * i);
          })(i);
        }
      },
      "move down": down,
      "move down to end": function() {
        txtToSpeech("moving down.");
        for (let i = 0; i < b.mapHeight; i++) {
          (function(i) {
            setTimeout(() => {
              down();
            }, 300 * i);
          })(i);
        }
      },
      "move left": left,
      "move left to end": function() {
        txtToSpeech("moving left.");
        for (let i = 0; i < b.mapWidth; i++) {
          (function(i) {
            setTimeout(() => {
              left();
            }, 300 * i);
          })(i);
        }
      },
      "new game": function() {
        b.reset(startKey, exitKey, mazeType, useWeights);
      },
      "help": function() {
        b.getPath();
        txtToSpeech(`You have rolled ${b.chosenPath}`);
        b.findPath(b.start);
      },
      "end game": function() {
        if (b.pathDisplayed === true) {
          const path = b.findPath(b.start);
          for (let i = 0; i < path.length; i++) {
            (function(i) {
              setTimeout(() => {
                b.redraw("player", path[i], undefined, true);
                if (i === path.length - 1) {
                  setTimeout(() => {
                    alert("end game");
                    b.reset(startKey, exitKey, mazeType, useWeights);
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
        mazeType = "recursive";
        b.reset(startKey, exitKey, mazeType, useWeights);
      },
      "activate random maze": function() {
        mazeType = "random";
        b.reset(startKey, exitKey, mazeType, useWeights);
      },
      "activate bombs mode": function() {
        useWeights = true;
        b.reset(startKey, exitKey, mazeType, useWeights);
      },
      "activate maze mode": function() {
        useWeights = false;
        b.reset(startKey, exitKey, mazeType, useWeights);
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
})();
