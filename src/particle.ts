import { Vector2D, RectangleData, ShapeData, ShapeType, ImageData, CanvasKitGame } from "./canvasKitGame";
import { Color } from "./Color";

export class ParticleEmitter{
    postion: Vector2D
    particlesPerSec: number
    particleType: ShapeType
    timeSinceLastSpawn: number
    ckg: CanvasKitGame

    constructor(postion: Vector2D, particleType: ShapeType, particlesPerSec: number, ckg: CanvasKitGame){
        this.postion = postion
        this.particlesPerSec = particlesPerSec
        this.particleType = particleType
        this.timeSinceLastSpawn = Date.now()
        this.ckg = ckg
    }

    spawn(shape: ShapeData){
        if(shape instanceof Particle) return 
        const timeDelta = Date.now() - this.timeSinceLastSpawn
        if(timeDelta < 1000/this.particlesPerSec) return
        this.timeSinceLastSpawn = Date.now()


        const particleShape = this.ckg.newRectangleData(this.getRandomTag(), shape.x, shape.y, 10, 10,true, new Color(231,122,32))
        const particle = new Particle(particleShape, {x: Math.random()*4 -2, y:-3}, {x:0,y: 0.1}, 2)
        this.ckg.entities.set(particleShape.tag, particle)
        
    }

    getRandomTag(){
        return `${Math.random()}${Math.random()}${Math.random}`
    }
}

export class Particle{
    velocity: Vector2D
    angularVelocity: number
    gravity: Vector2D
    shape: ShapeData
    z: number= 0

    constructor(shape: ShapeData, velocity: Vector2D, gravity: Vector2D, angularVelocity: number){
        this.shape = shape
        this.velocity = velocity
        this.gravity = gravity
        this.angularVelocity = angularVelocity
    }

    step(){
        if(this.shape instanceof Particle) return 
        this.shape.x += this.velocity.x 
        this.shape.y += this.velocity.y 

        this.velocity.x += this.gravity.x
        this.velocity.y += this.gravity.y

        if(this.shape instanceof RectangleData || this.shape instanceof ImageData){
            this.shape.rotationAngle += this.angularVelocity
        }
    }
}