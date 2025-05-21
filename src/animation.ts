export class Animation{
    startPropValues: number[]
    currentPropValues: number[]
    targetPropValues: number[]
    propNames: string[]
    elapsedTime: number = 0
    duration: number = 1000
    easingType: string = "linear"
    loop: boolean
    stepSize = 1
    /**
    * Creates a new animation object used to animate values such as "x", "y", "scale" and "rotation"
    * 
    *
    * @param {number[]} currentPropValues - This contains all the current values of the atributes you want to animate
    * @param {number[]} targetPropValues - This contains all the target values of the atributes you want to animate.
    * @param {string[]} propNames - This is the names of the attributes you can animate they inculde: "x", "y", "scale" and "rotation"
    * @param {string} easingType -This specifies the easing on the animation which can be either: "linear", "easeIn", "easeOut" or "easeInOut"
    * @param {number} duration -The duration of the animation in seconds
    * @param {boolean} loop -Specifies if the animation will loop or not
    */
    constructor(currentPropValues: number[], targetPropValues: number[], propNames: string[], easingType: string = "linear", duration= 1, loop = false){
        this.currentPropValues = [...currentPropValues]
        this.startPropValues = [...currentPropValues]
        this.targetPropValues = [...targetPropValues]
        this.propNames = [...propNames]
        this.duration = duration * 1000
        this.easingType = easingType
        this.loop = loop
    }
    isAnimationComplete(){
        return (Math.min(this.elapsedTime / this.duration, 1) >= 1)
    }
    step(deltaTime: number) {
        this.elapsedTime += deltaTime;

        const t = Math.min(this.elapsedTime / this.duration, 1);
        let easedT = t
        switch(this.easingType){
            case "linear":
                easedT = Animation.linear(t);
            break;
            case "easeIn":
                easedT = Animation.easeIn(t)
            break;
            case "easeOut":
                easedT = Animation.easeOut(t)
            break;
            case "easeInOut":
                easedT = Animation.easeInOut(t)
            break;
        }
        for(let i = 0;i < this.currentPropValues.length;i++){
            this.currentPropValues[i] = this.startPropValues[i] + (this.targetPropValues[i] - this.startPropValues[i]) * easedT;
        }

        if (t >= 1) {
            for(let i = 0;i < this.currentPropValues.length;i++){
                this.currentPropValues[i] = this.targetPropValues[i] 
            }
        }
    }
    private static easeInOut(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    private static easeIn(t: number): number {
        return t * t;
    }
    private static easeOut(t: number): number {
        return t * (2 - t);
    }
    private static linear(t: number): number {
        return t;
    }
}
