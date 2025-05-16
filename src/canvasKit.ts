
import { Color } from "./Color";

export class CanvasKit{
    width: number;
    height: number;
    ctx : CanvasRenderingContext2D;
    canvas: HTMLCanvasElement
    textRotation: number = 0;
    images: {[key: string]: HTMLImageElement} = {}
  
    constructor(canvasID: string, width: number = 500, height: number = 500){
        this.width = width
        this.height = height
        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement
        this.ctx = this.canvas.getContext("2d")!
        this.ctx.imageSmoothingEnabled = true
        this.canvas = this.canvas
        this.canvas.width = this.width
        this.canvas.height = this.height
    }
    /**
    * Clears the canvas of any shapes or images.
    */
    clear(){
        this.ctx.clearRect(0,0,this.width,this.height)
    }
    /**
    * Fills the entire canvas with a specified color.
    *
    * @param {Color} color - The color to fill the canvas with.
    */
    fillCanvas(color: Color){
        this.ctx.fillStyle = color.getColor()
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
    }
    /**
    * Draws a line from a starting point to an ending point.
    *
    * @param {number} sx - Starting x-coordinate.
    * @param {number} sy - Starting y-coordinate.
    * @param {number} ex - Ending x-coordinate.
    * @param {number} ey - Ending y-coordinate.
    * @param {Color} color - Color of the line.
    * @param {number} lineWidth - Width of the line.
    */
    line(sx: number, sy: number, ex: number, ey: number, color: Color, lineWidth: number = 1){
        this.ctx.strokeStyle = color.getColor()
        this.ctx.beginPath()
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(ex, ey);
        this.ctx.lineWidth = lineWidth
        this.ctx.stroke();
    }
     /**
    * Draws a circle at a specified point.
    * 
    * @param {number} x - x-coordinate.
    * @param {number} y - y-coordinate.
    * @param {number} r - Radius of the circle.
    * @param {boolean} fill - Whether the circle should be filled.
    * @param {Color} color - Color of the circle.
    * @param {number} lineWidth - Width of the outline if not filled.
    * @param {number} scale - Scale of the circle, scaled from its center.
    */
    circle(x: number, y:number, r:number, fill: boolean = true, color: Color, lineWidth: number = 1, scale: number = 1){
        this.ctx.save()
        this.ctx.beginPath();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-x, -y);
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = color.getColor()
        if(fill){
            this.ctx.fillStyle = color.getColor()
            this.ctx.fill()
        }
        this.ctx.lineWidth = lineWidth
        this.ctx.stroke();
        this.ctx.restore()
    }
    /**
    * Draws an arc at a specified point.
    * 
    * @param {number} x - x-coordinate.
    * @param {number} y - y-coordinate.
    * @param {number} r - Radius of the arc.
    * @param {boolean} fill - Whether the arc should be filled.
    * @param {Color} color - Color of the arc.
    * @param {number} lineWidth - Width of the outline if not filled.
    * @param {number} startAngle - Starting angle in degrees.
    * @param {number} endAngle - Ending angle in degrees.
    */
    arc(x: number, y:number, r:number, fill: boolean = true, color: Color, lineWidth: number = 1, startAngle: number, endAngle: number){
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, (startAngle * Math.PI)/180, (endAngle * Math.PI)/180);
        this.ctx.strokeStyle = color.getColor()
        if(fill){
            this.ctx.fillStyle = color.getColor()
            this.ctx.fill()
        }
        this.ctx.lineWidth = lineWidth
        this.ctx.stroke();
    }
    /**
    * Draws a rectangle at a specified point.
    * 
    * @param {number} x - x-coordinate.
    * @param {number} y - y-coordinate.
    * @param {number} width - Width of the rectangle.
    * @param {number} height - Height of the rectangle.
    * @param {boolean} fill - Whether the rectangle should be filled.
    * @param {Color} color - Color of the rectangle.
    * @param {number} borderWidth - Outline width if not filled.
    * @param {number} rotationAngle - Rotation angle in degrees.
    * @param {number} scale - Scale of the rectangle, scaled from its center.
    */
    rectangle(x: number, y: number, width: number, height: number, fill: boolean = true, color: Color, borderWidth: number =  1, rotationAngle: number = 0, scale: number = 1){
        this.ctx.save()
        let cx = x + width/2
        let cy = y + height/2
        if(scale != 1){
            this.ctx.translate(cx, cy);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-cx, -cy);
        }
        if(rotationAngle != 0){
            this.ctx.translate(cx, cy)
            this.ctx.rotate((rotationAngle*Math.PI)/180)
            this.ctx.translate(-cx, -cy)
        }
        if(fill){
            this.ctx.fillStyle = color.getColor()
            this.ctx.fillRect(x, y, width, height)
            this.ctx.restore()
            return
        }
        this.ctx.strokeStyle = color.getColor()
        this.ctx.lineWidth = borderWidth
        this.ctx.strokeRect(x, y, width, height)
        this.ctx.restore()
    }
    /**
    * Asynchronously registers an image from a given path. Must be called before drawing the image.
    * 
    * @param {string} imgPath - Relative path to the image, based on the location of your `index.html` file.
    * @param {string} imageTag - Key used to reference the loaded image.
    */
    async registerImage(imgPath: string, imageTag: string){
        const image = document.createElement("img")
        await new Promise((resolve, reject) => {
            image.onload = () => {
                this.images[imageTag] = image;
                resolve({msg: "succes"});
            };
            image.onerror = (error) => {
                reject(error); 
            };
            image.src = imgPath; 
        });
    }
    /**
    * Draws a previously registered image using its tag.
    * 
    * @param {string} imageTag - Tag referencing the registered image.
    * @param {number} x - x-coordinate.
    * @param {number} y - y-coordinate.
    * @param {number} scale - Scale of the image from its top-left corner.
    * @param {number} rotationAngle - Rotation angle in degrees.
    */
    image(imgTag: string, x: number, y: number, scale: number = 1, rotationAngle: number = 0){
        this.ctx.save()
        const img = this.images[imgTag];
        const cx = x + img.width*scale/2
        const cy = y + img.height*scale/2
        this.ctx.translate(cx, cy)
        this.ctx.rotate((rotationAngle*Math.PI)/180)
        this.ctx.translate(-cx, -cy)
        if (img) {
            this.ctx.drawImage(img, x, y, img.width * scale, (img.width * scale) * img.height / img.width)
        }else{
            throw new Error("Image not found:" + imgTag)
        }
        this.ctx.restore()
    }
    /**
    * Draws text at a specified position.
    * 
    * @param {string} text - Text to draw.
    * @param {number} fontSize - Font size.
    * @param {number} x - x-coordinate.
    * @param {number} y - y-coordinate.
    * @param {HorizontalAllign} HorAllign - Horizontal text alignment. Default is `center`.
    * @param {VerticleAllign} VertAllign - Vertical text alignment. Default is `middle`.
    * @param {Color} color - Color of the text.
    */
    text(text: string, fontSize: number, x: number, y: number, HorAllign: HorizontalAllign = HorizontalAllign.center, VertAllign: VerticleAllign = VerticleAllign.middle,color: Color){
        this.ctx.font = `${fontSize}px sans-serif`
        this.ctx.fillStyle = color.getColor()
        this.ctx.textBaseline = VertAllign
        this.ctx.textAlign = HorAllign
        this.ctx.fillText(text, x, y)
    }
    /**
    * Draws rotated text at a specified position and angle.
    * 
    * @param {string} text - Text to draw.
    * @param {number} fontSize - Font size.
    * @param {number} x - x-coordinate.
    * @param {number} y - y-coordinate.
    * @param {HorizontalAllign} HorAllign - Horizontal alignment. Default is `center`.
    * @param {VerticleAllign} VertAllign - Vertical alignment. Default is `alphabetic`.
    * @param {Color} color - Color of the text.
    * @param {number} rotationAngle - Rotation angle in degrees.
    */
    rotatedText(text: string, fontSize: number, x: number, y: number, HorAllign: HorizontalAllign = HorizontalAllign.center, VertAllign: VerticleAllign = VerticleAllign.alphabetic,color: Color, rotationAngle: number){
        this.ctx.save()
        this.ctx.translate(x, y)
        this.ctx.rotate((rotationAngle * Math.PI)/180);
        this.text(text, fontSize, 0,0, HorAllign, VertAllign, color)
        this.ctx.restore()
    }
}

export enum HorizontalAllign{
    center = "center",
    start = "start",
    end = "end"
}

export enum VerticleAllign{
    top = "top",
    middle = "middle",
    bottom = "bottom",
    alphabetic = "alphabetic"
}