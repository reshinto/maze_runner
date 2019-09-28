/* global annyang Board */

// (function() {
//   let startKey;
//   let exitKey;
//   let mazeType = "random";
//   let useWeights = false;
//   let useSpeech = false;
//   let attackSignal = true;
//   let pathDisplayed = false;
//   let isRolled = false;
//   const delay = 1000;
//   const rollDelay = 4000;
//   const slotC = document.getElementById("slot");
//   slotC.style.visibility = "hidden";
//   const slotCtx = slotC.getContext("2d");
//   const b = new Board(startKey, exitKey, mazeType, useWeights);


//   // Window and Navbar Events
//   const interval = setInterval(() => {
//     if (attackSignal === false) {
//       clearInterval(interval);
//     }
//     b.startMonstersAttack();
//   }, delay);

//   window.addEventListener("resize", () => {
//     b.reset(startKey, exitKey, mazeType, useWeights);
//   });

//   const newGame = document.getElementById("new");
//   newGame.addEventListener("click", () => {
//     attackSignal = false;
//     isRolled = false;
//     b.reset(startKey, exitKey, mazeType, useWeights);
//     setTimeout(()=>{
//       attackSignal = true;
//       const interval = setInterval(() => {
//         if (attackSignal === false) {
//           clearInterval(interval);
//         }
//         b.startMonstersAttack();
//       }, delay);
//     }, delay);
//   });

//   const gacha = document.getElementById("gacha");
//   gacha.addEventListener("click", () => {
//     if (!isRolled) {
//       attackSignal = false;
//       b.getPath();
//       slotC.style.visibility = "visible";
//       animateSlot();
//       txtToSpeech(`Rolling`);
//       setTimeout(()=>{
//         txtToSpeech(`You have rolled ${b.chosenPath}`);
//         setTimeout(() => {
//           slotC.style.visibility = "hidden";
//         }, 2000);
//         b.findPath(b.start);
//       }, rollDelay);
//     } else {
//       txtToSpeech(`You have already rolled ${b.chosenPath}`);
//     }
//     isRolled = true;
//   });

//   const recursiveLink = document.getElementById("recursive");
//   recursiveLink.addEventListener("click", () => {
//     isRolled = false;
//     mazeType = "recursive";
//     b.reset(startKey, exitKey, mazeType, useWeights);
//   });

//   const randomLink = document.getElementById("random");
//   randomLink.addEventListener("click", () => {
//     isRolled = false;
//     mazeType = "random";
//     b.reset(startKey, exitKey, mazeType, useWeights);
//   });

//   const mazeLink = document.getElementById("maze");
//   mazeLink.addEventListener("click", () => {
//     isRolled = false;
//     useWeights = false;
//     b.reset(startKey, exitKey, mazeType, useWeights);
//   });

//   const bombsLink = document.getElementById("bombs");
//   bombsLink.addEventListener("click", () => {
//     isRolled = false;
//     useWeights = true;
//     b.reset(startKey, exitKey, mazeType, useWeights);
//   });

//   const speechOnLink = document.getElementById("speechOn");
//   speechOnLink.addEventListener("click", () => {
//     useSpeech = true;
//     activateSpeech();
//   });

//   const speechOffLink = document.getElementById("speechOff");
//   speechOffLink.addEventListener("click", () => {
//     useSpeech = false;
//     activateSpeech();
//   });

//   // Slot events
//   function animateSlot() {
//     slotC.height = Math.floor(b.mainHeight * 0.2);
//     slotC.width = window.innerWidth;
//     const pathResult = b.chosenPath; // display random result
//     const pathList = b.pathSlots; // display all possible paths
//     const scale = Math.floor(window.innerWidth * 0.06); // Font size and overall scale
//     const breaks = 0.003; // Speed loss per frame
//     const endSpeed = 0.05; // Speed at which the text stops
//     const numOfFrames = 220; // number of frames until text stops (60/s)
//     // const delay = 40; // number of frames between texts
//     const pathMap = [];
//     let offsetV = endSpeed + breaks * numOfFrames;
//     let offset = -(1 + numOfFrames) * (breaks * numOfFrames + 2 * endSpeed) / 2;

//     for (let i=0; i<pathList.length; i++) {
//       pathMap[pathList[i]] = i;
//     }
//     function animate() {
//       slotCtx.setTransform(1, 0, 0, 1, 0, 0);
//       slotCtx.clearRect(0, 0, slotC.width, slotC.height);
//       slotCtx.globalAlpha = 1;
//       slotCtx.fillStyle = "#622";
//       slotCtx.fillRect(0, (slotC.height - scale) / 2, slotC.width, scale);
//       slotCtx.fillStyle = "#ccc";
//       slotCtx.textBaseline = "middle";
//       slotCtx.textAlign = "center";
//       slotCtx.setTransform(1, 0, 0, 1, Math.floor((slotC.width / 2)), Math.floor(slotC.height/2));
//       let o = offset;
//       while (o<0) o++; // ensure smooth spin stop
//       o %= 1;
//       const h = Math.ceil(slotC.height / 2 / scale);
//       for (let j=-h; j<h; j++) {
//         let c = pathMap[pathResult] + j - Math.floor(offset);
//         while (c<0) c += pathList.length;
//         c %= pathList.length;
//         const s = 1 - Math.abs(j + o) / (slotC.height / 2 / scale + 1);
//         slotCtx.globalAlpha = s;
//         slotCtx.font = scale * s + "px Helvetica";
//         slotCtx.fillText(pathList[c], 0, (j + o) * scale);
//       }
//       offset += offsetV; // required for spining
//       offsetV -= breaks; // required for slowing down spin
//       if (offsetV < endSpeed) { // required for stopping spin
//         offset = 0;
//         offsetV = 0;
//       }

//       requestAnimationFrame(animate);
//     }
//     animate();
//   }


//   // Keyboard presses events
//   window.addEventListener("keydown", keyboardEvents);

//   function keyboardEvents(e) {
//     switch (e.keyCode) {
//       case 87:
//       case 38:
//         up();
//         break;
//       case 68:
//       case 39:
//         right();
//         break;
//       case 83:
//       case 40:
//         down();
//         break;
//       case 65:
//       case 37:
//         left();
//         break;
//       default:
//         break;
//     }
//     if (b.startKey === b.exitKey) {
//       setTimeout(() => {
//         alert("end game");
//         b.reset(startKey, exitKey, mazeType, useWeights);
//         attackSignal = true;
//       }, 200);
//     }
//   }

//   function up() {
//     if (b.start.y > 0) {
//       b.redraw("player", -b.mapWidth);
//     } else {
//       b.randomReply();
//     }
//   }

//   function right() {
//     if (b.start.x < b.mapWidth * b.tileWidth - b.tileWidth) {
//       b.redraw("player", 1);
//     } else {
//       b.randomReply();
//     }
//   }

//   function down() {
//     if (b.start.y < b.mapHeight * b.tileHeight - b.tileHeight) {
//       b.redraw("player", +b.mapWidth);
//     } else {
//       b.randomReply();
//     }
//   }

//   function left() {
//     if (b.start.x > 0) {
//       b.redraw("player", -1);
//     } else {
//       b.randomReply();
//     }
//   }

//   // Text to speech events
//   function txtToSpeech(text) {
//     const msg = new SpeechSynthesisUtterance(text);
//     msg.lang = "ja-JP";
//     window.speechSynthesis.speak(msg);
//   }

//   // Voice command events
//   function commands() {
//     // Define commands
//     return {
//       "move up": up,
//       "move up to end": function() {
//         txtToSpeech("moving up.");
//         for (let i = 0; i < b.mapHeight; i++) {
//           (function(i) {
//             setTimeout(() => {
//               up();
//             }, 300 * i);
//           })(i);
//         }
//       },
//       "move right": right,
//       "move right to end": function() {
//         txtToSpeech("moving right.");
//         for (let i = 0; i < b.mapWidth; i++) {
//           (function(i) {
//             setTimeout(() => {
//               right();
//             }, 300 * i);
//           })(i);
//         }
//       },
//       "move down": down,
//       "move down to end": function() {
//         txtToSpeech("moving down.");
//         for (let i = 0; i < b.mapHeight; i++) {
//           (function(i) {
//             setTimeout(() => {
//               down();
//             }, 300 * i);
//           })(i);
//         }
//       },
//       "move left": left,
//       "move left to end": function() {
//         txtToSpeech("moving left.");
//         for (let i = 0; i < b.mapWidth; i++) {
//           (function(i) {
//             setTimeout(() => {
//               left();
//             }, 300 * i);
//           })(i);
//         }
//       },
//       "new game": function() {
//         attackSignal = false;
//         isRolled = false;
//         b.reset(startKey, exitKey, mazeType, useWeights);
//         attackSignal = true;
//       },
//       "help": function() {
//         if (!isRolled) {
//           attackSignal = false;
//           b.getPath();
//           slotC.style.visibility = "visible";
//           animateSlot();
//           txtToSpeech(`Rolling`);
//           setTimeout(()=>{
//             txtToSpeech(`You have rolled ${b.chosenPath}`);
//             setTimeout(() => {
//               slotC.style.visibility = "hidden";
//             }, 2000);
//             b.findPath(b.start);
//           }, rollDelay);
//           pathDisplayed = true;
//         } else {
//           txtToSpeech(`You have already rolled ${b.chosenPath}`);
//         }
//         isRolled = true;
//       },
//       "end game": function() {
//         if (pathDisplayed === true) {
//           const path = b.findPath(b.start, undefined, false, true);
//           for (let i = 0; i < path.length; i++) {
//             (function(i) {
//               setTimeout(() => {
//                 b.redraw("player", path[i], undefined, true);
//                 if (i === path.length - 1) {
//                   setTimeout(() => {
//                     alert("end game");
//                     b.reset(startKey, exitKey, mazeType, useWeights);
//                     attackSignal = true;
//                     const interval = setInterval(() => {
//                       if (attackSignal === false) {
//                         clearInterval(interval);
//                       }
//                       b.startMonstersAttack();
//                     }, delay);
//                   }, 200);
//                 }
//               }, 300 * i);
//             })(i);
//           }
//         } else {
//           txtToSpeech("No cheating allowed.");
//         }
//       },
//       "activate recursive maze": function() {
//         isRolled = false;
//         attackSignal = false;
//         mazeType = "recursive";
//         b.reset(startKey, exitKey, mazeType, useWeights);
//         attackSignal = true;
//       },
//       "activate random maze": function() {
//         isRolled = false;
//         attackSignal = false;
//         mazeType = "random";
//         b.reset(startKey, exitKey, mazeType, useWeights);
//         attackSignal = true;
//       },
//       "activate bombs mode": function() {
//         isRolled = false;
//         attackSignal = false;
//         useWeights = true;
//         b.reset(startKey, exitKey, mazeType, useWeights);
//         attackSignal = true;
//       },
//       "activate maze mode": function() {
//         isRolled = false;
//         attackSignal = false;
//         useWeights = false;
//         b.reset(startKey, exitKey, mazeType, useWeights);
//         attackSignal = true;
//       },
//       "deactivate voice mode": function() {
//         useSpeech = false;
//         activateSpeech();
//         txtToSpeech("Voice mode deactivated.");
//       },
//     };
//   }

//   function activateSpeech() {
//     if (useSpeech) {
//       if (annyang) {
//         txtToSpeech("Voice mode activated. Please give your command.");

//         // Add commands to annyang
//         annyang.addCommands(commands());

//         // Start listening.
//         annyang.start({paused: false});

//         annyang.addCallback("soundstart", function() {
//           console.log("sound detected");
//         });
//       } else {
//         annyang.abort();
//       }
//     }
//   }
// })();
