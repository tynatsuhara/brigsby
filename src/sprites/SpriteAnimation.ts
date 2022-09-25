import { AnimatedSpriteComponent } from "./AnimatedSpriteComponent"
import { ImageFilter, SpriteSource } from "./SpriteSource"
import { SpriteTransform } from "./SpriteTransform"
import { StaticSpriteSource } from "./StaticSpriteSource"

export class SpriteAnimation implements SpriteSource {
    readonly frames: [StaticSpriteSource, number][] // a list of (source, duration)
    readonly onFinish: () => void

    /**
     * @param frames A list of sprite sources and a duration in milliseconds that each one will last
     */
    constructor(frames: [StaticSpriteSource, number][], onFinish: () => void = () => {}) {
        this.frames = frames
        this.onFinish = onFinish
    }

    getSprite(index: number) {
        return this.frames[index][0]
    }

    toComponent(transform: SpriteTransform = new SpriteTransform()): AnimatedSpriteComponent {
        return new AnimatedSpriteComponent([this], transform)
    }

    filtered(filter: ImageFilter): SpriteAnimation {
        return new SpriteAnimation(this.frames.map((f) => [f[0].filtered(filter), f[1]]))
    }
}
