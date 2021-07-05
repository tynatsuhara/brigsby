import { Point } from "../Point"
import { ImageRender } from "../renderer/ImageRender"
import { SpriteTransform } from "./SpriteTransform"
import { SpriteComponent } from "./SpriteComponent"
import { SpriteSource } from "./SpriteSource"

export class StaticSpriteSource implements SpriteSource {
    readonly image: CanvasImageSource
    readonly position: Point
    readonly dimensions: Point

    /**
     * Constructs a static (non-animated) sprite source
     */
    constructor(
        image: CanvasImageSource, 
        position: Point,
        dimensions: Point
    ) {
        this.image = image
        this.position = position
        this.dimensions = dimensions
    }

    toImageRender(transform: SpriteTransform) {
        return new ImageRender(
            this.image, 
            this.position,
            this.dimensions, 
            transform.position, 
            transform.dimensions ?? this.dimensions,
            transform.depth,
            transform.rotation, 
            transform.mirrorX, 
            transform.mirrorY
        )
    }

    toComponent(transform: SpriteTransform = new SpriteTransform()): SpriteComponent {
        return new SpriteComponent(this, transform)
    }

    filtered(filter: (img: ImageData) => ImageData): StaticSpriteSource {
        const canvas = document.createElement("canvas")
        canvas.width = this.dimensions.x
        canvas.height = this.dimensions.y
        const context = canvas.getContext("2d")
        context.imageSmoothingEnabled = false
        
        context.drawImage(this.image, this.position.x, this.position.y, this.dimensions.x, this.dimensions.y, 0, 0, this.dimensions.x, this.dimensions.y)
        const imageData = context.getImageData(0, 0, this.dimensions.x, this.dimensions.y)
        const filtered = filter(imageData)
        context.putImageData(filtered, 0, 0)

        return new StaticSpriteSource(canvas, Point.ZERO, new Point(filtered.width, filtered.height))
    }
}
