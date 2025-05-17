import { Color } from "./Color"
import { HorizontalAllign, VerticleAllign, type CanvasKit } from "./canvasKit"
import { Animation } from "./animation";
import { Particle } from "./particle";


export class CanvasKitGame{
    entities: Map<string, ShapeData> = new Map();
    frameCount: number = 0
    draw: CanvasKit
    mousePosition: Vector2D = {x: 0, y: 0}
    deltaTime: number = 0
    onNewFrameEvents: Array<()=>void> = []
    sortZOnNewShapeCreation: boolean = true
    private previousFrameTime: number = 0

    constructor(drawInstance: CanvasKit){
        this.draw = drawInstance
        this.draw.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this))
        this.draw.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this))
    }
    /**
    * Removes a given shape from the render list
    * 
    * @param {string} tag - Tag of shape
    */
    removeShapeData(tag: string){
        if(!this.entities.has(tag)) return false
        this.entities.delete(tag)
    }
    /**
    * Removes any animation object on a given shape
    * 
    * @param {string} tag - Tag of shape
    */
    removeAnimations(tag: string){
        if(!this.entities.has(tag)) return
        //this.entities.get(tag)!._animations = []
    }
    /**
    * Sets the z-index of a shape, shapes with a higher z-index will be rendered above shapes with a smaller z-index
    * 
    * @param {string} tag - Tag of shape 
    */
    setZIndex(tag: string, zIndex: number){
        if(!this.entities.has(tag)) return false
        this.entities.get(tag)!.z = zIndex
        this.sortZIndex()
    }
    sortZIndex(){
        this.entities = new Map(
        [...this.entities.entries()].sort((entryA, entryB) => {
            const a = entryA[1], b = entryB[1];
            return a.z - b.z;
        }));
    }
    addFrameEvent(func: () => void){
        this.onNewFrameEvents.push(func)
    }
    /**
    * Draws a new frame with all the shapes added so far.
    *
    * @param {Color} color - Background color of the canvas.
    * @returns {number} - Time taken to draw the frame (ms).
    */
   count = 0
    drawFrame(color: Color = new Color(0,0,0)){
        const timerStart = performance.now()
        const draw = this.draw
        this.draw.fillCanvas(color)
        for(let sd of this.entities.values()){
            if(!sd.show) continue
            
            if (sd instanceof RectangleData) {
                draw.rectangle(sd.x, sd.y, sd.width, sd.height, sd.fill, sd.color, sd.borderWidth, sd.rotationAngle, sd.scale);
            } else if (sd instanceof CircleData) {
                draw.circle(sd.x, sd.y, sd.radius, sd.fill, sd.color, sd.lineWidth, sd.scale);
            } else if (sd instanceof TextData) {
                draw.rotatedText(sd.text, sd.fontSize, sd.x, sd.y, sd.HorAllign, sd.VertAllign, sd.color, sd.rotationAngle);
            } else if (sd instanceof LineData) {
                draw.line(sd.sx, sd.sy, sd.ex, sd.ey, sd.color, sd.lineThickness);
            } else if (sd instanceof ImageData) {
                draw.image(sd.tag, sd.x, sd.y, sd.scale, sd.rotationAngle);
            }
            this.handleAnimationStep(sd)
        }
        const p1 = performance.now();
        this.onNewFrameEvents.map(f => f())
        const p2 = performance.now()
        this.count += p2-p1
        console.log(`Avg Sim time: ${Math.round(this.count/this.frameCount*100)/100}ms`)
        this.frameCount++
        const timerEnd = performance.now();
        this.deltaTime = timerEnd - this.previousFrameTime
        this.previousFrameTime = performance.now()
        return timerEnd - timerStart
    }
    /**
    * Creates a new rectangle shape and adds it to the render list
    */
    newRectangleData(tag: string, x: number, y: number, width: number = 50, height: number = 50, fill: boolean = true, 
        color: Color = new Color(255,255,255), rotationAngle: number = 0, scale: number = 1, borderWidth: number = 1){
        const rectangleData = new RectangleData(tag, x, y, width, height, fill, color, borderWidth, rotationAngle, scale)
        this.entities.set(tag, rectangleData);
        (this.sortZOnNewShapeCreation) ? this.sortZIndex() : ""
        return rectangleData
    }
     /**
    * Creates a new circle shape and adds it to the render list
    */
    newCircleData(tag: string, x: number, y: number, radius: number = 10, fill: boolean = true,
        color: Color = new Color(255,255,255),scale: number = 1, lineWidth: number = 1){
        const circleData = new CircleData(tag, x, y, radius, fill, color, scale, lineWidth);
        this.entities.set(tag, circleData);
        (this.sortZOnNewShapeCreation) ? this.sortZIndex() : ""
        return circleData
    }
    /**
    * Creates a new text object and adds it to the render list
    */
    newTextData(tag: string, x: number, y: number, text: string, fontSize: number = 10, color: Color = new Color(255,255,255),
        HorAllign: HorizontalAllign = HorizontalAllign.center, VertAllign: VerticleAllign = VerticleAllign.middle, rotationAngle: number = 1){
        const textData = new TextData(tag, x, y, text, fontSize, color, HorAllign, VertAllign, rotationAngle);
        this.entities.set(tag, textData);
        (this.sortZOnNewShapeCreation) ? this.sortZIndex() : ""
        return textData
    }
     /**
    * Creates a new line object and adds it to the render list
    */
    newLineData(tag: string, sx: number, sy: number, ex: number, ey: number, lineThickness: number = 1,
        color: Color = new Color(255,255,255)){
        const lineData = new LineData(tag, sx, sy, ex, ey, lineThickness, color);
        this.entities.set(tag, lineData);
        (this.sortZOnNewShapeCreation) ? this.sortZIndex() : ""
        return lineData
    }
    /**
    * Creates a new image and adds it to the render list, returns a promise
    */
    async newImageData(tag: string, filePath: string, x: number, y: number, scale: number = 1, rotationAngle: number = 0){
        const imageData = new ImageData(tag, x, y, scale, rotationAngle);
        await this.draw.registerImage(filePath, tag)
        imageData.width = this.draw.images[tag].width
        imageData.height = this.draw.images[tag].height
        this.entities.set(tag, imageData);
        (this.sortZOnNewShapeCreation) ? this.sortZIndex() : ""
        return imageData
    }
    private handleMouseMove(e: MouseEvent){
        const rect = this.draw.canvas.getBoundingClientRect(); 
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.mousePosition = {x, y}
        for(const shape of this.entities.values()){
            if(!shape.isPointInsideShape(this.mousePosition.x, this.mousePosition.y)){
                shape._hoverState = (shape._hoverState == 2) ? 1 : 0
                if(shape._hoverState == 1) shape.onHoverExit?.()
                continue
            }
            shape.onHoverEnter?.()
            shape._hoverState = 2
        }
    }
    private handleMouseDown(_: MouseEvent){
        for(const shape of this.entities.values()){
            if(!shape.isPointInsideShape(this.mousePosition.x, this.mousePosition.y))continue
            shape.onClick?.()
        }
    }
    private handleAnimationStep(shape: ShapeData){
        if(!shape._animations) return
        if(shape._animations.length == 0) return
        if(shape._animations[0].isAnimationComplete()){
            if(shape._animations[0].loop){
                shape._animations[0].elapsedTime = 0
                for(let i = 0; i < shape._animations[0].startPropValues.length; i++){
                    shape._animations[0].targetPropValues[i] = shape._animations[0].startPropValues[i]
                    shape._animations[0].startPropValues[i] = shape._animations[0].currentPropValues[i]
                }
            }else{
                shape._animations.shift()
                return
            }
        }
        shape._animations[0].step(this.deltaTime)
        for(let i = 0; i < shape._animations[0].targetPropValues.length; i++){
            switch(shape._animations[0].propNames[i]){
                case "x":
                    shape.x = shape._animations[0].currentPropValues[i]
                break;
                case "y":
                    shape.y = shape._animations[0].currentPropValues[i]
                break;
                case "scale":
                    if(shape instanceof TextData || shape instanceof LineData) continue
                    shape.scale = shape._animations[0].currentPropValues[i]
                break
                case "rotation":
                    if(shape instanceof CircleData || shape instanceof LineData) continue
                    shape.rotationAngle = shape._animations[0].currentPropValues[i]
                break;
            }
        }
    }
}


export type ShapeData = RectangleData | CircleData | TextData | LineData | ImageData 
export type ShapeType = 'rectangle' | 'circle' | 'text' | 'line' | 'image';

abstract class BaseShapeData{
    x: number = 0
    y: number = 0
    z: number = 0
    show: boolean = true
    _animations: Animation[] = []
    addAnimation(animation: Animation){
        this._animations.push(animation)
    }
    removeAnimation(){
        this._animations = []
    }
    onClick?: () => void
    onHoverEnter?: () => void
    onHoverExit?: () => void
    _hoverState: number = 0
    public abstract isPointInsideShape(x: number, y: number): boolean
}
export class RectangleData extends BaseShapeData {
    type: ShapeType = "rectangle"
    constructor(
        public tag: string,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public fill: boolean,
        public color: Color,
        public borderWidth: number,
        public rotationAngle: number,
        public scale: number
    ) {
        super()
    }

    public isPointInsideShape(px: number, py: number): boolean {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        const dx = px - cx;
        const dy = py - cy;

        const angleRad = -this.rotationAngle * (Math.PI / 180);

        const unrotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
        const unrotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        const halfW = this.width*this.scale / 2;
        const halfH = this.height*this.scale / 2;

        return (
            unrotatedX >= -halfW &&
            unrotatedX <= halfW &&
            unrotatedY >= -halfH &&
            unrotatedY <= halfH
        );
    }
}
export class CircleData extends BaseShapeData{
    type: ShapeType = "circle"
    constructor(
        public tag: string,
        public x: number,
        public y: number,
        public radius: number = 10,
        public fill: boolean = true,
        public color: Color = new Color(255, 255, 255),
        public scale: number = 1,
        public lineWidth: number = 1
    ) {super();}
    public isPointInsideShape(x: number, y: number){
        console.log("ran")
        const dist = Math.sqrt(Math.pow(x-this.x, 2)+ Math.pow(y-this.y, 2))
        return (dist <= this.radius) ? true : false
    }
}
class TextData extends BaseShapeData{
    type: ShapeType = "text"
    constructor(
        public tag: string,
        public x: number,
        public y: number,
        public text: string,
        public fontSize: number,
        public color: Color = new Color(255, 255, 255),
        public HorAllign: HorizontalAllign = HorizontalAllign.center,
        public VertAllign: VerticleAllign = VerticleAllign.middle,
        public rotationAngle: number = 1
    ) {super(); }
    public isPointInsideShape(_: number, __: number){
        return false
    }
}
class LineData extends BaseShapeData{
    type: ShapeType = "line"
    constructor(
        public tag: string,
        public sx: number,
        public sy: number,
        public ex: number,
        public ey: number,
        public lineThickness: number = 1,
        public color: Color = new Color(255, 255, 255)
    ) {super(); }
    public isPointInsideShape(_: number, __: number){
        return false
    }
}
export class ImageData extends BaseShapeData{
    type: ShapeType = "image"
    public width: number = 0
    public height: number = 0
    constructor(
        public tag: string,
        public x: number,
        public y: number,
        public scale: number = 1,
        public rotationAngle: number = 0
    ) {super(); }
    public isPointInsideShape(px: number, py: number){
        const dx = px - this.x;
        const dy = py - this.y;

        const unscaledX = dx / this.scale;
        const unscaledY = dy / this.scale;

        const cx = this.width / 2;
        const cy = this.height / 2;

        const centeredX = unscaledX - cx;
        const centeredY = unscaledY - cy;

        const angleRad = -this.rotationAngle * (Math.PI / 180);
        const rotatedX = centeredX * Math.cos(angleRad) - centeredY * Math.sin(angleRad);
        const rotatedY = centeredX * Math.sin(angleRad) + centeredY * Math.cos(angleRad);

        return (
            rotatedX >= -cx &&
            rotatedX <= cx &&
            rotatedY >= -cy &&
            rotatedY <= cy
        );
    }
}
export interface Vector2D{
    x: number
    y: number
}


