import { Vector2D, RectangleData, ShapeData, ShapeType, ImageData, CanvasKitGame } from "./canvasKitGame";
import { Color } from "./Color";

export class ParticleEmitter{
    postion: Vector2D
    particlesPerSec: number
    particleProps: ParticleProps
    timeSinceLastSpawn: number
    particles: Particle[] = []
    ckg: CanvasKitGame

    constructor(postion: Vector2D, particlesPerSec: number, ckg: CanvasKitGame, particleProps: ParticleProps){
        this.postion = postion
        this.particlesPerSec = particlesPerSec
        this.particleProps = {...particleProps}
        this.timeSinceLastSpawn = Date.now()
        this.ckg = ckg
        this.ckg.addFrameEvent(() => this.spawn())
    }

    spawn(){
        const currentTime = Date.now()

        const indexsToDelete: number[]= []
        this.particles.forEach((p, i)=> {
            p.step()
            if(currentTime - p.timeCreated > p.lifeSpan * 1000){
                this.ckg.removeShapeData(p.shape.tag)
                indexsToDelete.push(i)
            }
        })
        this.particles = this.particles.filter((_, i) => !indexsToDelete.includes(i))

        const timeDelta = currentTime - this.timeSinceLastSpawn
        if(timeDelta < 1000/this.particlesPerSec) return
        this.timeSinceLastSpawn = currentTime


        if(this.particleProps.shapeType == "rectangle"){
            const particleShape = this.ckg.newRectangleData(this.getRandomTag(), this.postion.x, this.postion.y, this.particleProps.width, this.particleProps.height, this.particleProps.fill, this.particleProps.color, this.particleProps.rotationAngle)
            const particle = new Particle(particleShape, this.applyVariation(this.particleProps.velocityVariation, this.particleProps.velocity), this.particleProps.gravity, this.particleProps.angularVelocity, this.particleProps.lifeSpan)
            this.particles.push(particle)
            this.ckg.entities.set(particleShape.tag, particleShape)

        }else if(this.particleProps.shapeType == "circle"){
            const particleShape = this.ckg.newCircleData(this.getRandomTag(), this.postion.x, this.postion.y, this.particleProps.raduis, this.particleProps.fill, this.particleProps.color)
            const particle = new Particle(particleShape, this.applyVariation(this.particleProps.velocityVariation, this.particleProps.velocity), this.particleProps.gravity, this.particleProps.angularVelocity, this.particleProps.lifeSpan)
            this.particles.push(particle)
            this.ckg.entities.set(particleShape.tag, particleShape)
        }
       
    }
    private applyVariation(variation: Vector2D, value: Vector2D){
        const x = value.x + (Math.random() * variation.x - (variation.x/2))
        const y = value.y + (Math.random() * variation.y - (variation.y/2))
        return {x, y}
    }
    
    getRandomTag(){
        return `${Math.random()}${Math.random()}${Math.random}`
    }
}
export class ParticleProps {
    shapeType: ShapeType = "rectangle"
    x: number = 0;
    y: number = 0;
    width: number = 10;
    height: number = 10;
    raduis: number = 5;
    color: Color = new Color(123,43,210);
    fill: boolean = true;
    rotationAngle: number = 0;
    velocity: Vector2D = { x: Math.random() * 4 - 2, y: -2};
    velocityVariation: Vector2D = {x: 4, y: 4}
    angularVelocity: number = 0;
    gravity: Vector2D = { x: 0, y: 0.1 };
    lifeSpan: number = 2;

    constructor(props: Partial<ParticleProps> = {}) {
        Object.assign(this, props);
    }
}
export class Particle{
    velocity: Vector2D
    angularVelocity: number
    gravity: Vector2D
    shape: ShapeData
    timeCreated: number
    lifeSpan: number
    z: number= 0

    constructor(shape: ShapeData, velocity: Vector2D, gravity: Vector2D, angularVelocity: number = 0, lifeSpan: number){
        this.shape = shape
        this.velocity = {...velocity}
        this.gravity = {...gravity}
        this.angularVelocity = angularVelocity
        this.lifeSpan = lifeSpan
        this.timeCreated = Date.now()
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