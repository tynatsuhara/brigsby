import { UpdateData } from "../Engine"
import { Animator } from "../util/Animator"
import { SpriteComponent } from "./SpriteComponent"
import { SpriteAnimation } from "./SpriteAnimation"
import { SpriteTransform } from "./SpriteTransform"

export class AnimatedSpriteComponent extends SpriteComponent {
    private animator: Animator
    private animations: SpriteAnimation[]

    constructor(animations: SpriteAnimation[], transform: SpriteTransform = new SpriteTransform()) {
        if (animations.length < 1) {
            throw new Error("needs at least one animation!")
        }
        const defaultAnimation = animations[0]
        super(defaultAnimation.getSprite(0), transform)
        this.animations = animations
        this.goToAnimation(0)
    }

    currentFrame() {
        return this.animator.getCurrentFrame()
    }

    /**
     * @param animationIndex the index in the array passed to the constructor
     */
    goToAnimation(animationIndex: number) {
        const anim = this.animations[animationIndex]
        this.animator = new Animator(
            anim.frames.map(f => f[1]), 
            index => {
                this.sprite = anim.getSprite(index)
            },
            anim.onFinish
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

    // This won't currently refresh the animation
    applyFilter(filter: (img: ImageData) => ImageData) {
        this.animations = this.animations.map(a => a?.filtered(filter))
    }
}
