class Node {
  constructor(key, weight, vertex) {
    const image = new Image();
    this.key = key;
    this.weight = weight;
    this.vertex = vertex;
    image.onload = () => {
      this.vertex.ctx.drawImage(
        image,
        this.vertex.coords.x,
        this.vertex.coords.y
      );
    };
    image.src = "/images/floor2.png";

    if (this.vertex.wall >= 2) {
      const image2 = new Image();
      image2.onload = () => {
        this.vertex.ctx.drawImage(
          image2,
          this.vertex.coords.x,
          this.vertex.coords.y
        );
      };
      image2.src = !vertex.useWeights ? "/images/wall.png" : "/images/bomb.png";
    }
  }
}
