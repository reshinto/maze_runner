class Node {
  constructor(key, weight, vertex) {
    const image = new Image();
    this.key = key;
    this.weight = weight;
    this.vertex = vertex;
    // draw maze floor as background
    image.onload = () => {
      this.vertex.ctx.drawImage(
        image,
        this.vertex.coords.x,
        this.vertex.coords.y,
      );
    };
    image.src = "/images/floor.png";

    if (this.vertex.wall >= 2) {
      const image2 = new Image();
      image2.onload = () => {
        this.vertex.ctx.drawImage(
          image2,
          this.vertex.coords.x,
          this.vertex.coords.y,
        );
      };
      image2.src = !vertex.useWeights ? "/images/wall.png" : "/images/bomb.png";
    }

    // draw monster
    const image3 = new Image();
    for (let i = 0; i < this.vertex.monsterList.length; i++) {
      if (
        this.vertex.coords.x ===
          this.vertex.monsterList[i][`monster${i}`].x &&
        this.vertex.coords.y === this.vertex.monsterList[i][`monster${i}`].y
      ) {
        image3.onload = () => {
          this.vertex.ctx.drawImage(
            image3,
            this.vertex.coords.x,
            this.vertex.coords.y,
          );
        };
        break;
      }
    }
    image3.src = "/images/monster.png";
  }
}
