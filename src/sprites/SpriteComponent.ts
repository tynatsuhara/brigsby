import { ImageRender } from "../renderer/ImageRender"
import { Component } from "../Component"
import { SpriteTransform } from "./SpriteTransform"
import { StaticSpriteSource } from "./StaticSpriteSource"

/**
 * Represents a static (non-animated) sprite entity
 */
export class SpriteComponent extends Component {
    sprite: StaticSpriteSource
    readonly transform: SpriteTransform

    constructor(sprite: StaticSpriteSource, transform: SpriteTransform = new SpriteTransform()) {
        super()
        this.sprite = sprite
        this.transform = transform

        if (!transform.dimensions) {
            transform.dimensions = sprite.dimensions
        }
    }
    
    getRenderMethods(): ImageRender[] {
        return [this.sprite.toImageRender(this.transform)]
    }
}
