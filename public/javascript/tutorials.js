// tutorial events
let isTutorialClick = false;
let isCommandsClick = false;
let pageNum = 1;
const tutorials = document.getElementById("tutorials");
const options = document.getElementById("options");
const tutorial = document.getElementById("tutorial");
const voiceCommands = document.getElementById("commands");
const totalPages = document.getElementsByClassName("tut-wrapper");
const pages = document.getElementById("pages");
pages.innerHTML = totalPages.length;
const page = document.getElementById("page");
page.innerHTML = pageNum;

const skip = document.getElementById("skip");
skip.addEventListener("click", () => {
  tutorials.style.display = "none";
});

const prev = document.getElementById("prev");
prev.addEventListener("click", () => {
  if (isCommandsClick) {
    isCommandsClick = false;
    voiceCommands.style.display = "none";
    tutorial.style.display = "flex";
    next.style.display = "inline-block";
    skip.innerHTML = "Skip Tutorial";
    pageNum -= 1;
    page.innerHTML = pageNum;
  } else if (isTutorialClick) {
    isTutorialClick = false;
    options.style.display = "flex";
    tutorial.style.display = "none";
    prev.style.display = "none";
    pageNum -= 1;
    page.innerHTML = pageNum;
  }
});

const next = document.getElementById("next");
next.addEventListener("click", () => {
  options.style.display = "none";
  if (!isTutorialClick) {
    tutorial.style.display = "flex";
    isTutorialClick = true;
    prev.style.display = "inline-block";
    pageNum += 1;
    page.innerHTML = pageNum;
  } else if (!isCommandsClick) {
    tutorial.style.display = "none";
    voiceCommands.style.display = "flex";
    next.style.display = "none";
    skip.innerHTML = "Close Tutorial";
    isCommandsClick = true;
    pageNum += 1;
    page.innerHTML = pageNum;
  }
});


