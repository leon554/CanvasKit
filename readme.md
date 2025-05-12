# **CanvasKit**
CanvasKit is a light weight simple HTML Canvas wrapper which provides an simple interface to create complex graphics and dynamic scenes
## Installation
To use in your project run 
```
npm install canvaskitgame
```

## **Features** 
### CanvasKit
CanvasKit provides a simple API to interact with the canvas and draw shapes, images and lines. Drawable entities include:
- Lines, Circles, Arcs, Rectangles, Images and Text

**Example**
```typescript
const ck = new CanvasKit("canvasID", 500, 500)
ck.rectangle(250,250, 50,50, true, new Color(200,100,200), 1, 45)
```
### CanvasKitGame
CanvasKitGame extends canvasKit providing more functionality. Instead of drawing shapes straight to the canvas you can now register shapes and draw all shapes with the `drawFrame` function. This allows you to set up a game loop and easily manipulate shape data to create a more dynamic scene. Features include:
- Animations with easing
- Events (onClick, OnHoverEnter and OnHoverExit)
- Z-index render order
- Tag system

**Example**
```typescript
const ck = new CanvasKit("canvas", 500, 500)
const ckg = new CanvasKitGame(ck)

const r1 = ckg.newRectangleData("r1", 0, 200)
r1.addAnimation(new Animation([0, 1, 0], [440, 1.3, 360], ["x", "scale", "rotation"], "easeOut", 1, true))

function loop(){
  ckg.drawFrame()
  requestAnimationFrame(loop)
}
loop() 
```
## Usage
### CanvasKit
To create a simple scene in CanvasKit
1. Create a new html canvas and give it an id
2. Create a new instance of CanvasKit passing in the canvas id, width and height 
```typescript
const ck = new CanvasKit("canvasID", 500, 500)
```
3. Create a new rectangle by calling the `rectangle` method which takes in: x-pos, y-pos, width, height, fill, color, borderWidth, rotationAngle and scale
```typescript
ck.rectangle(100, 100, 40, 40, true, new Color(0,0,0), 1, 45, 1)
```
### CanvasKitGame
To create a circle that depresses when you click on it and springs back we need to:
1. Create a new CanvasKitGame instance which takes in a CanvasKit instance
```typescript
const ckg = new CanvasKitGame(new CanvasKit("canvas", 500, 500))
``` 
2. Next we need to create a new circle shape by calling the function `newCircleData` which takes in: a tag for your new shape, x-pos, y-pos and radius, note there are more optional parameters. `newCircleData` will then return a new CircleData instance
```typescript
const r1 = ckg.newCircleData("c1", 200, 200, 50)
```
3. We can now create a new `onClick` event on our circle
```typescript
r1.onClick = () => {

}
```
4. Now we can add our animations
```typescript
 r1.onClick = () => {
  r1.addAnimation(new Animation([1], [0.8], ["scale"], "linear", 0.1, false))
  r1.addAnimation(new Animation([0.8], [1], ["scale"], "easeOut", 0.1, false))
}
```
5. Finally we can call the `drawFrame` method in our game loop and click on our circle our final code should be as follows
```typescript
const ckg = new CanvasKitGame(new CanvasKit("canvas", 500, 500))

const r1 = ckg.newCircleData("c1", 200, 200, 50)

r1.onClick = () => {
  r1.addAnimation(new Animation([1], [0.8], ["scale"], "linear", 0.1, false))
  r1.addAnimation(new Animation([0.8], [1], ["scale"], "easeOut", 0.1, false))
}

function loop(){
  ckg.drawFrame()
  requestAnimationFrame(loop)
}
loop() 
```
## API Reference
**CanvasKit Methods**

`clear()`

`fillCanvas(color: Color)`

`line(sx: number, sy: number, ex: number, ey: number, color: Color, lineWidth: number = 1)`

`circle(x: number, y:number, r:number, fill: boolean = true, color: Color, lineWidth: number = 1, scale: number = 1)`

`arc(x: number, y:number, r:number, fill: boolean = true, color: Color, lineWidth: number = 1, startAngle: number, endAngle: number)`

`rectangle(x: number, y: number, width: number, height: number, fill: boolean = true, color: Color, borderWidth: number =  1, rotationAngle: number = 0, scale: number = 1)`

`async registerImage(imgPath: string, imageTag: string)`

`image(imgTag: string, x: number, y: number, scale: number = 1, rotationAngle: number = 0)`

`text(text: string, fontSize: number, x: number, y: number, HorAllign: HorizontalAllign = HorizontalAllign.center, VertAllign: VerticleAllign = VerticleAllign.middle,color: Color)`

`rotatedText(text: string, fontSize: number, x: number, y: number, HorAllign: HorizontalAllign = HorizontalAllign.center, VertAllign: VerticleAllign = VerticleAllign.alphabetic,color: Color, rotationAngle: number)`

**CanvisKitGame Methods**

`removeShapeData(tag: string)`

`removeAnimations(tag: string)`

`setZIndex(tag: string, zIndex: number)`

`drawFrame(color: Color = new Color(0,0,0))`

`newRectangleData(tag: string, x: number, y: number, width: number = 50, height: number = 50, fill: boolean = true, color: Color = new Color(255,255,255), rotationAngle: number = 0, scale: number = 1, borderWidth: number = 1)`

`newCircleData(tag: string, x: number, y: number, radius: number = 10, fill: boolean = true,
color: Color = new Color(255,255,255),scale: number = 1, lineWidth: number = 1)`

`newTextData(tag: string, x: number, y: number, text: string, fontSize: number = 10, color: Color = new Color(255,255,255)`

`newLineData(tag: string, sx: number, sy: number, ex: number, ey: number, lineThickness: number = 1, color: Color = new Color(255,255,255))`

`async newImageData(tag: string, filePath: string, x: number, y: number, scale: number = 1, rotationAngle: number = 0)`

**Animation Methods**

`isAnimationComplete()`
