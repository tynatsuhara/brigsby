import { AnimatedSpriteComponent } from "./AnimatedSpriteComponent"
import { ImageFilter, SpriteSource } from "./SpriteSource"
import { SpriteTransform } from "./SpriteTransform"
import { StaticSpriteSource } from "./StaticSpriteSource"

export class SpriteAnimation implements SpriteSource {
    /**
     * @param frames A list of sprite sources and a duration in milliseconds that each one will last
     */
    constructor(
        readonly frames: [StaticSpriteSource, number][],
        readonly onFinish: () => void = () => {},
        private readonly pauseSupplier: () => boolean = () => false
    ) {}

    getSprite(index: number) {
        return this.frames[index][0]
    }

    toComponent(transform: SpriteTransform = new SpriteTransform()): AnimatedSpriteComponent {
        return new AnimatedSpriteComponent([this], transform, this.pauseSupplier)
    }

    filtered(filter: ImageFilter): SpriteAnimation {
        return new SpriteAnimation(
            this.frames.map((f) => [f[0].filtered(filter), f[1]]),
            this.onFinish,
            this.pauseSupplier
        )
    }
}
