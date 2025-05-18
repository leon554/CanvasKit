export class Color{
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number){
      this.r = r;
      this.g = g;
      this.b = b;
    }
    setColor(color: Color){
      this.r = color.r
      this.g = color.g
      this.b = color.b
    }
    getColor(){
      return "rgb(" + this.r + "," + this.g + "," + this.b + ")"
    }
    static getRandomColor(){
      return new Color(Math.random()*255,Math.random()*255,Math.random()*255)
    }
}