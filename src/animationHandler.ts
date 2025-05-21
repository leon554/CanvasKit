import { ShapeData, LineData, TextData, CircleData} from "./canvasKitGame"
import { Animation } from "./animation"

export class AnimationHandler{

    public static handleAnimationStep(shape: ShapeData, deltaTime: number){
        if(!shape._animations) return
        if(shape._animations.length == 0) return
        const animation = shape._animations[0]
    
        const shouldReturn = AnimationHandler.proccessAnimationCompletion(shape._animations)
        if(shouldReturn) return
    
        animation.step(deltaTime)
        AnimationHandler.updateAnimationValues(animation, shape)
    }
    private static updateAnimationValues(animation: Animation, shape: ShapeData){
        for(let i = 0; i < animation.targetPropValues.length; i++){
            switch(animation.propNames[i]){
                case "x":
                    shape.x = animation.currentPropValues[i]
                break;
                case "y":
                    shape.y = animation.currentPropValues[i]
                break;
                case "scale":
                    if(!(shape instanceof TextData) && !(shape instanceof LineData)){
                        shape.scale = animation.currentPropValues[i]
                    }
                break
                case "rotation":
                    if(!(shape instanceof CircleData) && !(shape instanceof LineData)){
                        shape.rotationAngle = animation.currentPropValues[i]
                    }
                break;
            }
        }
    }
    private static proccessAnimationCompletion(animations: Animation[]){
        const animation = animations[0]
        if(!animation || !animations[0].isAnimationComplete()) return false
    
        if(animation.loop){
            animation.elapsedTime = 0
            for(let i = 0; i < animation.startPropValues.length; i++){
                animation.targetPropValues[i] = animation.startPropValues[i]
                animation.startPropValues[i] = animation.currentPropValues[i]
            }
            return false
        }else{
            animations.shift()
            return true
        }     
    }
}