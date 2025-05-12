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
