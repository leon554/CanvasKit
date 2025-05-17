import { Vector2D, RectangleData, ShapeData, ShapeType, ImageData, CanvasKitGame } from "./canvasKitGame";
import { Color } from "./Color";

export class ParticleEmitter{
    postion: Vector2D
    particlesPerSec: number
    particleProps: ParticleEmitterProps
    timeSinceLastSpawn: number
    particles: Particle[] = []
    ckg: CanvasKitGame
    totalParticleCount: number = 0
    currentParticleIndex: number = 0

    constructor(postion: Vector2D, particlesPerSec: number, ckg: CanvasKitGame, particleProps: ParticleEmitterProps){
        this.postion = postion
        this.particlesPerSec = particlesPerSec
        this.particleProps = {...particleProps}
        this.timeSinceLastSpawn = Date.now()
        this.ckg = ckg
        this.totalParticleCount = Math.min(particlesPerSec*particleProps.lifeSpan, 60*particleProps.lifeSpan)
        this.ckg.addFrameEvent(() => this.spawn())
        this.loadParticles()
    }
    loadParticles(){
        for(let i = 0; i < this.totalParticleCount; i++){
            let particleShape: ShapeData|null =  null
            if(this.particleProps.shapeType == "rectangle"){
                particleShape = this.ckg.newRectangleData(this.getRandomTag(), this.postion.x, this.postion.y, this.particleProps.width, this.particleProps.height, this.particleProps.fill, undefined, this.particleProps.rotationAngle)
            }else if(this.particleProps.shapeType == "circle"){
                particleShape = this.ckg.newCircleData(this.getRandomTag(), this.postion.x, this.postion.y, this.particleProps.raduis, this.particleProps.fill, undefined)
            }
            if(!particleShape) throw new Error("Shape type specified does not exist")
            if(!(particleShape instanceof ImageData)){
                particleShape.color.setColor(this.particleProps.startColor)
            }
            
            const {velocityVariation, velocity, gravity, angularVelocity, lifeSpan, startColor, endColor} = this.particleProps;
            const particle = new Particle({
                shape: particleShape,
                velocity: this.applyVariation(velocityVariation, velocity),
                gravity,
                angularVelocity,
                lifeSpan,
                startColor,
                endColor
            });
            this.particles.push(particle)
            this.ckg.entities.set(particleShape.tag, particleShape)
            particleShape.show = false, particle.active = false
        }
    }
    incrementParicleIndex(){
        (this.currentParticleIndex < this.totalParticleCount-1) ? this.currentParticleIndex++ : this.currentParticleIndex = 0
    }
    createNewParticle(currentTime: number){
        const newParticle = this.particles[this.currentParticleIndex]
        newParticle.active = true, newParticle.shape.show = true
        newParticle.shape.x = this.postion.x
        newParticle.shape.y = this.postion.y
        newParticle.timeCreated = currentTime
        newParticle.velocity = this.applyVariation(this.particleProps.velocityVariation, this.particleProps.velocity)
        if(!(newParticle.shape instanceof ImageData)){
            newParticle.shape.color.r = newParticle.startColor.r
            newParticle.shape.color.g = newParticle.startColor.g
            newParticle.shape.color.b = newParticle.startColor.b
        }
        this.incrementParicleIndex()
    }
    spawn(){
        const currentTime = Date.now()

        this.particles.forEach((p, i)=> {
            if(currentTime - p.timeCreated > p.lifeSpan * 1000){
                p.active = false, p.shape.show = false, p.timeCreated = currentTime
            }else if(p.active){
                p.step(this.ckg.deltaTime)
            }
        })

        const timeDelta = currentTime - this.timeSinceLastSpawn
        if(timeDelta < 1000/this.particlesPerSec) return
        this.timeSinceLastSpawn = currentTime

        this.createNewParticle(currentTime)
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
export class ParticleEmitterProps {
    shapeType: ShapeType = "rectangle"
    x: number = 0;
    y: number = 0;
    width: number = 10;
    height: number = 10;
    raduis: number = 5;
    startColor: Color = new Color(123,43,210);
    endColor: Color = new Color(0,0,255);
    fill: boolean = true;
    rotationAngle: number = 0;
    velocity: Vector2D = { x: Math.random() * 4 - 2, y: -2};
    velocityVariation: Vector2D = {x: 4, y: 4}
    angularVelocity: number = 0;
    gravity: Vector2D = { x: 0, y: 0.1 };
    lifeSpan: number = 2;

    constructor(props: Partial<ParticleEmitterProps> = {}) {
        Object.assign(this, props);
    }
}
type ParticleProps = {
    shape: ShapeData
    velocity: Vector2D
    gravity: Vector2D
    angularVelocity: number
    lifeSpan: number
    startColor: Color
    endColor: Color
}
export class Particle{
    velocity: Vector2D
    angularVelocity: number
    gravity: Vector2D
    shape: ShapeData
    timeCreated: number
    lifeSpan: number
    active: boolean = true
    z: number= 0
    startColor: Color
    endColor: Color

    constructor(particleProps: ParticleProps){
        this.shape = particleProps.shape
        this.velocity = {...particleProps.velocity}
        this.gravity = {...particleProps.gravity}
        this.angularVelocity = particleProps.angularVelocity
        this.lifeSpan = particleProps.lifeSpan
        this.timeCreated = Date.now()
        this.startColor = particleProps.startColor
        this.endColor = particleProps.endColor
    }

    step(deltaTime: number){
        if(!this.active) return 
        deltaTime = deltaTime/10
        this.shape.x += this.velocity.x  * deltaTime
        this.shape.y += this.velocity.y  * deltaTime

        this.velocity.x += this.gravity.x * deltaTime
        this.velocity.y += this.gravity.y * deltaTime
        if(!(this.shape instanceof ImageData)){
            const progress = Math.min(1, (Date.now() - this.timeCreated) / (this.lifeSpan * 1000));

            this.shape.color.r = this.startColor.r + (this.endColor.r - this.startColor.r) * progress;
            this.shape.color.g = this.startColor.g + (this.endColor.g - this.startColor.g) * progress;
            this.shape.color.b = this.startColor.b + (this.endColor.b - this.startColor.b) * progress;
        }

        if(this.shape instanceof RectangleData || this.shape instanceof ImageData){
            this.shape.rotationAngle += this.angularVelocity
        }

    }
}