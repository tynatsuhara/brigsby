import { Point } from "../Point"
import { AsyncRenderer } from "./AsyncRenderer"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"

export class ImageRender extends RenderMethod {
    source: CanvasImageSource
    sourcePosition: Point // the top-left coordinate position on the source image
    sourceDimensions: Point
    dimensions: Point
    position: Point // top-left coordinate position in the view
    rotation: number // clockwise rotation in degrees
    mirrorX: boolean
    mirrorY: boolean
    alpha: number

    constructor(
        source: CanvasImageSource,
        sourcePosition: Point,
        sourceDimensions: Point,
        position: Point,
        dimensions: Point,
        depth: number = 0,
        rotation: number = 0,
        mirrorX: boolean = false,
        mirrorY: boolean = false,
        alpha: number = 1
    ) {
        super(depth)
        this.source = source
        this.sourcePosition = sourcePosition
        this.sourceDimensions = sourceDimensions
        this.position = position
        this.dimensions = dimensions
        this.rotation = rotation
        this.mirrorX = mirrorX
        this.mirrorY = mirrorY
        this.alpha = alpha
    }

    render(context: RenderContext) {
        const pixelPerfect = false // TODO make this work properly

        context.drawImage(
            this.source,
            this.sourcePosition,
            this.sourceDimensions,
            this.position,
            this.dimensions,
            this.rotation,
            pixelPerfect,
            this.mirrorX,
            this.mirrorY,
            this.alpha
        )
    }

    renderAsync(renderer: AsyncRenderer): void {
        const id = renderer.uploadImage(this.source)
        if (!id) {
            return
        }

        renderer.post({
            t: "i",
            d: this.depth,
            i: id,
            spx: this.sourcePosition.x,
            spy: this.sourcePosition.y,
            sdx: this.sourceDimensions.x,
            sdy: this.sourceDimensions.y,
            dx: this.dimensions.x,
            dy: this.dimensions.y,
            px: this.position.x,
            py: this.position.y,
            r: this.rotation,
            mx: this.mirrorX,
            my: this.mirrorY,
            a: this.alpha,
        })
    }
}
