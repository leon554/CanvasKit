import { Vector2D} from "./canvasKitGame";
import { Color } from "./Color";



export type ParticleEmitterProps = RectangleParticleProps | CircleParticleProps | ImageParticleProps


class BaseParticleProps{
    x: number = 0;
    y: number = 0;

    velocity: Vector2D = { x: Math.random() * 4 - 2, y: -2};
    velocityVariation: Vector2D = {x: 4, y: 4}
    gravity: Vector2D = { x: 0, y: 0.1 };
    gravityVariation: Vector2D = { x: 0.1, y: 0.1 };

    startScale: number = 1
    endScale: number = 2

    startColor: Color = new Color(123,43,210);
    endColor: Color = new Color(0,0,255);

    lifeSpan: number = 2;
}
export class RectangleParticleProps extends BaseParticleProps {
    width: number = 10;
    height: number = 10;
    fill: boolean = true;
    rotationAngle: number = 0;
    angularVelocity: number = 0;

    constructor(props: Partial<RectangleParticleProps> = {}) {
        super()
        Object.assign(this, props);
    }
}
export class CircleParticleProps extends BaseParticleProps {
    raduis: number = 10
    fill: boolean = true;

    constructor(props: Partial<RectangleParticleProps> = {}) {
        super()
        Object.assign(this, props);
    }
}
export class ImageParticleProps extends BaseParticleProps {
    filePath: string = ""
    width: number = 10;
    height: number = 10;
    fill: boolean = true;
    rotationAngle: number = 0;
    angularVelocity: number = 0;

    constructor(props: Partial<ImageParticleProps> = {}) {
        super()
        if (!('filePath' in props)) {
            throw new Error("Must specify file path in reletive form")
        }
        Object.assign(this, props);
    }
}