import { Vector2D, RectangleData, ShapeData, ImageData, CanvasKitGame, CircleData } from "./canvasKitGame";
import { Color } from "./Color";
import { CircleParticleProps, ImageParticleProps, ParticleEmitterProps, RectangleParticleProps } from "./particleTypes";

export type ParticleEmitterFlags = {
    burstMode: boolean,
    useCircularVariation: boolean,
    randomColoredParticles: boolean
}
export class ParticleEmitter{
    postion: Vector2D
    particlesPerSec: number
    particleProps: ParticleEmitterProps
    timeSinceLastSpawn: number
    particles: Particle[] = []
    ckg: CanvasKitGame
    totalParticleCount: number = 0
    flags: ParticleEmitterFlags = {
        burstMode: true,
        useCircularVariation: false,
        randomColoredParticles: false
    }
    active: boolean = true
    private currentParticleIndex: number = 0
    private delayDelete = false

    constructor(postion: Vector2D, particlesPerSec: number, ckg: CanvasKitGame,  particleProps: ParticleEmitterProps){
        this.postion = postion
        this.particlesPerSec = particlesPerSec
        this.particleProps = particleProps
        this.timeSinceLastSpawn = Date.now()
        this.ckg = ckg
        this.totalParticleCount = Math.min(particlesPerSec*particleProps.lifeSpan, 60*particleProps.lifeSpan)
        this.ckg.addFrameEvent(() => this.spawn())
        const load = async () => {await this.loadParticles()}
        load()
    }
    private async loadParticles(){
        const promises = []
        for (let i = 0; i < this.totalParticleCount; i++) {
            promises.push(this.initNewParitcle())
        }
        await Promise.all(promises)
    }
    private async initNewParitcle(){
        let particleShape: ShapeData|null =  null
        if(this.particleProps instanceof RectangleParticleProps){
            particleShape = this.ckg.newRectangleData(this.getRandomTag(), this.postion.x, this.postion.y, this.particleProps.width, this.particleProps.height, this.particleProps.fill, undefined, this.particleProps.rotationAngle)
        }
        else if(this.particleProps instanceof CircleParticleProps){
            particleShape = this.ckg.newCircleData(this.getRandomTag(), this.postion.x, this.postion.y, this.particleProps.raduis, this.particleProps.fill, undefined)
        }
        else if(this.particleProps instanceof ImageParticleProps){
            particleShape = await this.ckg.newImageData(this.getRandomTag(), this.particleProps.filePath, this.postion.x, this.postion.y, 0.1, this.particleProps.rotationAngle)
        }

        if(!particleShape) throw new Error("ParticleProps of invalid instance")
        if(!(particleShape instanceof ImageData)){
            if(this.flags.randomColoredParticles){
                particleShape.color = Color.getRandomColor()
            }else{
                particleShape.color.setColor(this.particleProps.startColor)
            }
        }
        const particle = new Particle(particleShape, this.particleProps, this.flags.randomColoredParticles)
        this.particles.push(particle), this.ckg.entities.set(particleShape.tag, particleShape)
        particleShape.show = false, particle.active = false
    }
    async setBurstParticleCount(particleCount: number){
        this.deleteSelf()
        this.totalParticleCount = particleCount
        await this.loadParticles()
    }
    spawn(){
        if(this.particles.length == 0) return

        let isActiveParticles = false
        const currentTime = Date.now()
        this.particles.forEach((p, i)=> {
            if(currentTime - p.timeCreated > p.lifeSpan * 1000){
                p.active = false, p.shape.show = false
            }else if(p.active){
                p.step(this.ckg.deltaTime)
                isActiveParticles = true
            }
        })
        if(!isActiveParticles && this.delayDelete) this.deleteSelf()

        const timeDelta = currentTime - this.timeSinceLastSpawn
        if(timeDelta < 1000/this.particlesPerSec) return
        this.timeSinceLastSpawn = currentTime

        if(!this.active) return
        this.createNewParticle(currentTime)
    }
    private createNewParticle(currentTime: number){
        const newParticle = this.particles[this.currentParticleIndex]
        newParticle.randomColor = this.flags.randomColoredParticles
        newParticle.active = true, newParticle.shape.show = true
        newParticle.shape.x = this.postion.x
        newParticle.shape.y = this.postion.y
        newParticle.timeCreated = currentTime
        
        newParticle.velocity = this.applyVariation(this.particleProps.velocityVariation, this.particleProps.velocity)
        if(!(newParticle.shape instanceof ImageData)){
            if(this.flags.randomColoredParticles){
                newParticle.shape.color = (Color.getRandomColor())
            }else{
                newParticle.shape.color.setColor(this.particleProps.startColor)
            }
        }
        if(newParticle.shape instanceof RectangleData || newParticle.shape instanceof ImageData || newParticle.shape instanceof CircleData){
            newParticle.shape.scale = this.particleProps.startScale
        }
        this.incrementParicleIndex()
    }
    deactivateEmitter(){
        this.currentParticleIndex = 0
        this.active = false
    }
    deleteSelf(){
        this.particles.forEach(p => {
            this.ckg.removeShapeData(p.shape.tag)
        })
        this.particles = []
    }
    deleteSelfWhenFinished(){
        this.active = false
        this.delayDelete = true
    }
    activateEmitter(){
        this.active = true
    }
    burst(){
        if(!this.flags.burstMode) throw new Error("burstMode must be true to use this function")
        for(let i = 0; i < this.totalParticleCount;i++){
            this.createNewParticle(Date.now())
        }
    }
    refreshParticlePropsData(){
        this.particles.forEach((p, _)=> {
            p.startColor = this.particleProps.startColor
            p.endColor = this.particleProps.endColor
            p.startScale = this.particleProps.startScale
            p.endScale = this.particleProps.endScale
        })
    }
    private applyVariation(variation: Vector2D, value: Vector2D){
        if(this.flags.useCircularVariation){
            return this.applyCircularVariation(variation, value)
        }
        return this.applyUniformVariation(variation, value)
    }
    private applyUniformVariation(variation: Vector2D, value: Vector2D){
        const x = value.x + (Math.random() * variation.x - (variation.x/2))
        const y = value.y + (Math.random() * variation.y - (variation.y/2))
        return {x, y}
    }
    private applyCircularVariation(variation: Vector2D, value: Vector2D){
        const speed = Math.sqrt(value.x * value.x + value.y * value.y)
        const variationHyp = Math.sqrt(variation.x * variation.x + variation.y * variation.y)

        const angle = Math.random() * 2 * Math.PI; 
        const radius = speed + (Math.random() * variationHyp - variationHyp / 2); 

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }
    private getRandomTag(){
        return `${Math.random()}${Math.random()}${Math.random}`
    }
    private incrementParicleIndex(){
        (this.currentParticleIndex < this.totalParticleCount-1) ? this.currentParticleIndex++ : this.currentParticleIndex = 0
    }
}

class Particle{
    velocity!: Vector2D
    angularVelocity!: number
    gravity!: Vector2D
    shape: ShapeData
    timeCreated: number
    lifeSpan!: number
    active: boolean = true
    z: number= 0
    startColor!: Color
    endColor!: Color
    startScale!: number
    endScale!: number
    randomColor: boolean

    constructor(particleShape: ShapeData, particleProps: ParticleEmitterProps, randomColor: boolean){
        this.shape = particleShape
        this.timeCreated = Date.now()
        this.randomColor = randomColor
        this.startColor = particleProps.startColor
        this.endColor = particleProps.endColor
        this.startScale = particleProps.startScale
        this.endScale = particleProps.endScale
        this.velocity = {...particleProps.velocity}
        this.gravity = {...particleProps.gravity}
        this.angularVelocity = (!(particleProps instanceof CircleParticleProps)) ? particleProps.angularVelocity : 0
        this.lifeSpan = particleProps.lifeSpan
    } 

    step(deltaTime: number){
        if(!this.active) return 
        deltaTime = deltaTime/10
        this.shape.x += this.velocity.x  * deltaTime
        this.shape.y += this.velocity.y  * deltaTime

        this.velocity.x += this.gravity.x * deltaTime
        this.velocity.y += this.gravity.y * deltaTime

        const progress = Math.min(1, (Date.now() - this.timeCreated) / (this.lifeSpan * 1000));

        if(this.shape instanceof RectangleData || this.shape instanceof ImageData){
            this.shape.rotationAngle += this.angularVelocity
        }
        if(this.shape instanceof RectangleData || this.shape instanceof ImageData || this.shape instanceof CircleData){
            this.shape.scale = this.startScale + (this.endScale - this.startScale) * progress
        }
        if(this.randomColor) return
        if(!(this.shape instanceof ImageData)){
            this.shape.color.r = this.startColor.r + (this.endColor.r - this.startColor.r) * progress;
            this.shape.color.g = this.startColor.g + (this.endColor.g - this.startColor.g) * progress;
            this.shape.color.b = this.startColor.b + (this.endColor.b - this.startColor.b) * progress;
        }
        
    }
}