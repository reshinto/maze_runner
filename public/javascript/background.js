(function() {
  const c = document.getElementById("background");
  const bgCtx = c.getContext("2d");
  const getScreenHeight = window.innerHeight;
  const getScreenWidth = window.innerWidth;

  c.width = getScreenWidth;
  c.height = getScreenHeight;

  /**
  * Stars class
  * @param {object} options object of x and y coordinates
  */
  class Star {
    constructor(options) {
      this.minSize = Math.random() * 0.1;
      this.maxSize = Math.random() * 3;
      this.size = Math.random() * 1;
      this.speed = Math.random() * 0.02;
      this.x = options.x; // position is added during initialization
      this.y = options.y; // position is added during initialization
    }

    reset() {
      this.size = Math.random() * 2;
      this.speed = Math.random() * 0.02;
      this.x = getScreenWidth;
      this.y = Math.random() * getScreenHeight;
    }

    update() {
      // set x coordinate of star
      this.x -= this.speed;
      if (this.x < 0) {
        // reset star position to the right end
        this.reset();
      } else {
        this.glow();
        // moves star to the left when updated
        bgCtx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    glow() {
      const size = Math.random() * 6;
      this.size =
      size >= this.maxSize
        ? this.maxSize / 2
        : size <= this.minSize
        ? this.minSize
        : size;
    }
  }

  const starArray = [];
  // Add total number of stars
  for (let i = 0; i < getScreenHeight; i++) {
    const randX = Math.random();
    const randY = Math.random();
    starArray.push(
      new Star({
        x: randX * getScreenWidth,
        y: randY * getScreenHeight,
      }),
    );
  }

  /**
   * Activate animation of stars blinking
   */
  function animate() {
    // color rectangle background
    bgCtx.fillStyle = "#000000";
    // draws the rectangle background
    bgCtx.fillRect(0, 0, getScreenWidth, getScreenHeight);
    // color stars
    bgCtx.fillStyle = "#ffffff";
    // color shooting stars
    bgCtx.strokeStyle = "#ffffff";

    // get total num of stars
    let starLen = starArray.length;
    // update all stars position
    while (starLen--) {
      starArray[starLen].update();
    }
    // enable the shooting stars and star moving animation
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    animate();
  });
}());
