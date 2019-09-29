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

