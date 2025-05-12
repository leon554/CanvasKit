export class Color{
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number){
      this.r = r;
      this.g = g;
      this.b = b;
    }
    getColor(){
      return "rgb(" + this.r + "," + this.g + "," + this.b + ")"
    }
}