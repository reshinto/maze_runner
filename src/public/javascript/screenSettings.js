let mazeHeight;

(function() {
  const main = document.getElementsByTagName("main");
  const header = document.getElementsByTagName("header");
  const canvas = document.getElementById("maze");

  const headerStr = window
    .getComputedStyle(header[0])
    .getPropertyValue("height");
  const headerHeight = headerStr.slice(0, headerStr.length - 2);
  mazeHeight = window.innerHeight - headerHeight;

  function setMazeHeight(mazeHeight) {
    main[0].style.height = `${mazeHeight}px`;
    canvas.style.height = `${mazeHeight - 40}px`;
    canvas.style.width = `${window.innerWidth - 40}px`;
    console.log(canvas.style.height, canvas.style.width);
  }

  setMazeHeight(mazeHeight);

  window.addEventListener("resize", () => {
    mazeHeight = window.innerHeight - 150;
    setMazeHeight(mazeHeight);
  });
})();

