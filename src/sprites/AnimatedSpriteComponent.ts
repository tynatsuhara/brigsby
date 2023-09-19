import { UpdateData } from "../Engine"
import { Animator } from "../util/Animator"
import { SpriteAnimation } from "./SpriteAnimation"
import { SpriteComponent } from "./SpriteComponent"
import { ImageFilter } from "./SpriteSource"
import { SpriteTransform } from "./SpriteTransform"

export class AnimatedSpriteComponent extends SpriteComponent {
    private animator: Animator
    private animationIndex: number

    constructor(
        private animations: SpriteAnimation[],
        transform: SpriteTransform = new SpriteTransform(),
        private readonly pauseSupplier: () => boolean = () => false
    ) {
        if (animations.length < 1) {
            throw new Error("needs at least one animation!")
        }
        const defaultAnimation = animations[0]
        super(defaultAnimation.getSprite(0), transform)
        this.goToAnimation(0)
    }

    currentFrame() {
        return this.animator.getCurrentFrame()
    }

    /**
     * @param animationIndex the index in the array passed to the constructor
     */
    goToAnimation(animationIndex: number) {
        this.animationIndex = animationIndex
        const anim = this.animations[animationIndex]
        this.animator = new Animator(
            anim.frames.map((f) => f[1]),
            (index) => this.updateSprite(index),
            anim.onFinish,
            this.pauseSupplier
        )
        return this
    }

    pause() {
        this.animator.paused = true
    }

    play() {
        this.animator.paused = false
    }

    update(updateData: UpdateData) {
        if (!this.animator.paused) {
            this.animator.update(updateData.elapsedTimeMillis)
        }
    }

    fastForward(ms: number) {
        this.animator.update(Math.floor(ms))
    }

    applyFilter(filter: ImageFilter) {
        this.animations = this.animations.map((a) => a?.filtered(filter))
        this.updateSprite()
    }

    private updateSprite(frame = this.currentFrame()) {
        this.sprite = this.animations[this.animationIndex].getSprite(frame)
    }
}
