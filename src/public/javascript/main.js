/* global annyang Board */

(function() {
  // const start = {x: 0, y: 0};
  // const exit = {x: 90, y: 180};
  let start;
  let exit;
  let mazeType = "random";
  let useWeights = false;
  let useSpeech = false;

  const b = new Board(start, exit, mazeType, useWeights);
  window.addEventListener("resize", () => {
    b.reset(start, exit, mazeType, useWeights);
  });

  const newGame = document.getElementById("new");
  newGame.addEventListener("click", () => {
    b.reset(start, exit, mazeType, useWeights);
  });

  const gacha = document.getElementById("gacha");
  gacha.addEventListener("click", () => {
    b.findPath(b.start);
  });

  const recursiveLink = document.getElementById("recursive");
  recursiveLink.addEventListener("click", () => {
    mazeType = "recursive";
    b.reset(start, exit, mazeType, useWeights);
  });

  const randomLink = document.getElementById("random");
  randomLink.addEventListener("click", () => {
    mazeType = "random";
    b.reset(start, exit, mazeType, useWeights);
  });

  const mazeLink = document.getElementById("maze");
  mazeLink.addEventListener("click", () => {
    useWeights = false;
    b.reset(start, exit, mazeType, useWeights);
  });

  const bombsLink = document.getElementById("bombs");
  bombsLink.addEventListener("click", () => {
    useWeights = true;
    b.reset(start, exit, mazeType, useWeights);
  });

  const speechOnLink = document.getElementById("speechOn");
  speechOnLink.addEventListener("click", () => {
    useSpeech = true;
    activateSpeech();
  });

  const speechOffLink = document.getElementById("speechOff");
  speechOffLink.addEventListener("click", () => {
    useSpeech = false;
  });

  window.addEventListener("keydown", check);

  function check(e) {
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
        b.reset(start, exit, mazeType, useWeights);
      }, 200);
    }
  }

  function up() {
    if (!useSpeech) {
      if (b.start.y > 0) {
        b.redraw("player", -b.mapWidth);
      }
    }
  }

  function right() {
    if (!useSpeech) {
      if (b.start.x < b.mapWidth * b.tileWidth - b.tileWidth) {
        b.redraw("player", 1);
      }
    }
  }

  function down() {
    if (!useSpeech) {
      if (b.start.y < b.mapHeight * b.tileHeight - b.tileHeight) {
        b.redraw("player", +b.mapWidth);
      }
    }
  }

  function left() {
    if (!useSpeech) {
      if (b.start.x > 0) {
        b.redraw("player", -1);
      }
    }
  }

  function activateSpeech() {
    if (useSpeech) {
      if (annyang) {
        // Define commands
        const commands = {
          up: up(useSpeech),
          right: right(useSpeech),
          down: down(useSpeech),
          left: left(useSpeech),
        };

        // Add commands to annyang
        annyang.addCommands(commands);

        // Start listening.
        annyang.start();
      }
    }
  }
}());
