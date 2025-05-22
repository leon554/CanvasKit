# **CanvasKit**
CanvasKit is a light weight HTML Canvas wrapper which provides an simple interface to create complex graphics and dynamic scenes
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
- Keyboard Inputs And Events
- Particle System

**Example**
```typescript
const ckg = new CanvasKitGame(new CanvasKit("canvas", 500, 500))

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
### CanvasKitGame-Animation Example
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
4. Now we can add our animations the first parameter is an array of the start values where out animation will start. The second parameter is an array of the end values of our animation with the third parameter specifing what each value represenets such as "scale", "x", "y" and/or "rotation"
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
### CanvasKitGame-Particle Example
To create a confetti effect we can do the following:

1. Create a new CanvasKitGame instance which takes in a CanvasKit instance
```typescript
const ckg = new CanvasKitGame(new CanvasKit("canvas", 500, 500))
``` 
2. Create a new ParticleEmitterProps instance which can be any one of the following: `RectangleParticleProps`, `CircleParticleProps` or `ImageParticleProps` each one has unique properties associated with the given shape.
```typescript
const particleProps = new RectangleParticleProps({
  gravity: {x: 0, y: 0.03},
  velocityVariation: {x: 1.5, y: 0},
  width: 7,
  height: 2,
  angularVelocity: 4
})
```
3. We can now create a ParitlceEmmiter and pass in a position, particlesPerSecond and the particleProps we just created. We can also set the randomColoredParticle flag to true so our effect will look more like confetti.
```typescript
const pe = new ParticleEmitter({x: 250, y: 250}, 50, ckg, particleProps)
pe.flags.randomColoredParticles = true 
```
4. Finally we can just call the `drawFrame()` method. Our final code should look like this 
```typescript
import { CanvasKit, CanvasKitGame, ParticleEmitter, RectangleParticleProps } from "canvaskitgame"

const ckg = new CanvasKitGame(new CanvasKit("canvas", 500, 500))

const particleProps = new RectangleParticleProps({
  gravity: {x: 0, y: 0.03},
  velocityVariation: {x: 1.5, y: 0},
  width: 7,
  height: 2,
  angularVelocity: 4
})
const pe = new ParticleEmitter({x: 250, y: 250}, 50, ckg, particleProps)
pe.flags.randomColoredParticles = true 

function loop(){

  ckg.drawFrame()
  requestAnimationFrame(loop)
}
loop() 
```
5. Aditionally we can also create a burst affect that happens every time a key is pressed with the following code
```typescript
import { CanvasKit, CanvasKitGame, ParticleEmitter, RectangleParticleProps } from "canvaskitgame"

const ckg = new CanvasKitGame(new CanvasKit("canvas", 500, 500))

const particleProps = new RectangleParticleProps({
  gravity: {x: 0, y: 0.03},
  velocity: {x: 0, y: 0},
  velocityVariation: {x: 8, y: 8},
  width: 7,
  height: 2,
  angularVelocity: 10
})
const pe = new ParticleEmitter({x: 250, y: 250}, 50, ckg, particleProps)
pe.flags.randomColoredParticles = true 
pe.flags.burstMode = true
pe.flags.useCircularVariation = true
pe.setBurstParticleCount(400)
pe.deactivateEmitter()

ckg.keyBoard.addNewKeyPressEvent("t", () => {
  pe.emitBurst()
})

function loop(){

  ckg.drawFrame()
  requestAnimationFrame(loop)
}
loop() 

```
![burst](https://github.com/user-attachments/assets/c15ceaf2-0009-4289-8753-7708b77f5ed5)
![Recording 2025-05-22 125743](https://github.com/user-attachments/assets/02e20d7b-19ac-4a86-9c7f-6bb6f25cbdb6)

