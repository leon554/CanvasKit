import { Vector2D, RectangleData, ShapeData, ImageData, CanvasKitGame, CircleData } from "./canvasKitGame";
import { Color } from "./Color";
import { CircleParticleProps, ImageParticleProps, ParticleEmitterProps, RectangleParticleProps } from "./particleTypes";

export type ParticleEmitterFlags = {
    burstMode: boolean,
    useCircularVariation: boolean,
    randomColoredParticles: boolean
}
export class ParticleEmitter{
    position: Vector2D
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
    private frameEventTag: string

    constructor(position: Vector2D, particlesPerSec: number, ckg: CanvasKitGame,  particleProps: ParticleEmitterProps){
        this.position = position
        this.particlesPerSec = particlesPerSec
        this.particleProps = particleProps
        this.timeSinceLastSpawn = Date.now()
        this.ckg = ckg
        this.frameEventTag = ckg.getRandomTag()
        this.totalParticleCount = Math.min(particlesPerSec*particleProps.lifeSpan, 60*particleProps.lifeSpan)
        this.ckg.addFrameEvent(this.frameEventTag, () => this.updateParticles())
        const load = async () => {await this.loadParticles()}
        load()
    }
    private async loadParticles(){
        const promises = []
        for (let i = 0; i < this.totalParticleCount; i++) {
            promises.push(this.initNewParticle())
        }
        await Promise.all(promises)
    }
    private async initNewParticle(){
        let particleShape: ShapeData|null =  null
        if(this.particleProps instanceof ImageParticleProps){
            particleShape = await this.particleProps.createShape(this.ckg, this.position)
        }else{
            particleShape = this.particleProps.createShape(this.ckg, this.position)
        }

        if(!particleShape) throw new Error("Invalid ParticleProps instance: must be RectangleParticleProps, CircleParticleProps, or ImageParticleProps.")
        this.applyParticleColor(particleShape)
        const particle = new Particle(particleShape, this.particleProps, this.flags.randomColoredParticles)
        this.particles.push(particle), this.ckg.entities.set(particleShape.tag, particleShape)
        particleShape.show = false, particle.active = false
    }

    /**
    * Sets the number of particles emitted when the burstMode flag is true
    *
    * @param {number} particleCount - Number of particles emitted
    */
    async setBurstParticleCount(particleCount: number){
         this.particles.forEach(p => {
            this.ckg.removeShapeData(p.shape.tag)
        })
        this.particles = []
        this.totalParticleCount = particleCount
        await this.loadParticles()
    }
     /**
    * Emits a burst particle effect if the burstMode flag is true.
    */
    emitBurst(){
        if(!this.flags.burstMode) throw new Error("burstMode must be true to use this function")
        const currentTime = Date.now()
        for(let i = 0; i < this.totalParticleCount;i++){
            this.createNewParticle(currentTime)
        }
    }
    /**
    * Deactivates the emitter. It will no longer emit new particles and will wait for all 
    * currently active particles to finish their lifespan.
    */
    deactivateEmitter(){
        this.currentParticleIndex = 0
        this.active = false
    }
    /**
    * Immediately removes all particles from the render list. Cannot activate this emitter again.
    */
    deleteSelf(){
        this.particles.forEach(p => {
            this.ckg.removeShapeData(p.shape.tag)
        })
        this.particles = []
        this.ckg.removeFrameEvent(this.frameEventTag)
    }
    /**
    * Waits until all currently active particles have finished, then removes all particles from the render list.
    * Note: After this function is called, you cannot activate this emitter again.
    */
    deleteSelfWhenFinished(){
        this.active = false
        this.delayDelete = true
    }
    /**
    * Reactivates the emitter after deactivateEmitter() is called.
    */
    activateEmitter(){
        this.active = true
    }
    /**
    * Updates the particleProps object if changes occurred. 
    * Note: Only updates startColor, endColor, startScale, and endScale.
    */
    refreshParticlePropsData(){
        this.particles.forEach((p, _)=> {
            p.startColor = this.particleProps.startColor
            p.endColor = this.particleProps.endColor
            p.startScale = this.particleProps.startScale
            p.endScale = this.particleProps.endScale
            p.velocity = {...this.applyVariation(this.particleProps.velocityVariation, this.particleProps.velocity)}
        })
    }

    private updateParticles(){
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
        if(!isActiveParticles && this.delayDelete) {this.deleteSelf()}

        const timeDelta = currentTime - this.timeSinceLastSpawn
        if(timeDelta < 1000/this.particlesPerSec) return
        this.timeSinceLastSpawn = currentTime

        if(!this.active) return
        this.createNewParticle(currentTime)
    }
    private createNewParticle(currentTime: number){
        const newParticle = this.particles[this.currentParticleIndex]
        newParticle.randomColor = this.flags.randomColoredParticles
        newParticle.shape.x = this.position.x
        newParticle.shape.y = this.position.y
        newParticle.timeCreated = currentTime
        
        newParticle.velocity = this.applyVariation(this.particleProps.velocityVariation, this.particleProps.velocity)
        this.applyParticleColor(newParticle.shape)
        if(newParticle.shape instanceof RectangleData || newParticle.shape instanceof ImageData || newParticle.shape instanceof CircleData){
            newParticle.shape.scale = this.particleProps.startScale
        }

        newParticle.active = true, newParticle.shape.show = true
        this.incrementParticleIndex()
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

    private incrementParticleIndex(){
        (this.currentParticleIndex < this.totalParticleCount-1) ? this.currentParticleIndex++ : this.currentParticleIndex = 0
    }
    private applyParticleColor(particleShape: ShapeData){
        if(particleShape instanceof ImageData) return
        if(this.flags.randomColoredParticles){
            particleShape.color = Color.getRandomColor()
        }else{
            particleShape.color.setColor(this.particleProps.startColor)
        }  
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