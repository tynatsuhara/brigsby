import { debug } from "../Debug"
import { Point } from "../Point"
import { ImageRender } from "../renderer/ImageRender"
import { rotSpriteCanvas } from "./rotSpriteCanvas"
import { rotSpriteWebGL } from "./rotSpriteWebGL"
import { SpriteComponent } from "./SpriteComponent"
import { ImageFilter, SpriteSource } from "./SpriteSource"
import { SpriteTransform } from "./SpriteTransform"

export class StaticSpriteSource implements SpriteSource {
    readonly image: CanvasImageSource
    readonly position: Point
    readonly dimensions: Point

    /**
     * Constructs a static (non-animated) sprite source
     *
     * @param image the source image (which may contain multiple sprites)
     * @param position the pixel position of the sprite (from the top left)
     * @param dimensions the dimensions of the sprite
     */
    constructor(image: CanvasImageSource, position: Point, dimensions: Point) {
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

    /**
     * @param filter if nullish, returns itself
     */
    filtered(filter: ImageFilter): StaticSpriteSource {
        if (!filter) {
            return this
        }

        const canvas = document.createElement("canvas")
        canvas.width = this.dimensions.x
        canvas.height = this.dimensions.y
        const context = canvas.getContext("2d")
        context.imageSmoothingEnabled = false

        context.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.dimensions.x,
            this.dimensions.y,
            0,
            0,
            this.dimensions.x,
            this.dimensions.y
        )
        const imageData = context.getImageData(0, 0, this.dimensions.x, this.dimensions.y)
        const filtered = filter(imageData)
        context.putImageData(filtered, 0, 0)

        return new StaticSpriteSource(
            canvas,
            Point.ZERO,
            new Point(filtered.width, filtered.height)
        )
    }

    /**
     * Generates a new sprite by rotating this sprite clockwise using RotSprite
     * https://en.wikipedia.org/wiki/Pixel-art_scaling_algorithms#RotSprite
     * This is more expensive than applying rotation with the SpriteTransform, but
     * gives a "pixel perfect" rotation rather than displaying pixels at an angle.
     *
     * @param method
     *     webgl: very fast, but there are a limited number of contexts available,
     *            so this is not a good choice if you're calling this in rapid succession
     *     canvas (default): slower, but not limited like webgl is
     */
    rotated(degree: number, method: "webgl" | "canvas" = "canvas"): StaticSpriteSource {
        // normalize degree [0, 360)
        degree = degree % 360
        if (degree < 0) {
            degree += 360
        }

        if (degree === 0) {
            return this
        }

        const startTime = new Date().getTime()
        const rotateFn = method === "webgl" ? rotSpriteWebGL : rotSpriteCanvas
        const result = rotateFn(this.image, this.position, this.dimensions, degree)
        if (debug.spriteRotateDebug) {
            console.log(`sprite rotation took ${new Date().getTime() - startTime} milliseconds`)
        }

        return new StaticSpriteSource(result, Point.ZERO, new Point(result.width, result.height))
    }
}
