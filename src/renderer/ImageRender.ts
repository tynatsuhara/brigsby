import { Point } from "../Point"
import { RenderMethod } from "./RenderMethod"
import { RenderContext } from "./RenderContext"

export class ImageRender extends RenderMethod {
    source: CanvasImageSource
    sourcePosition: Point  // the top-left coordinate position on the source image
    sourceDimensions: Point
    dimensions: Point
    position: Point  // top-left coordinate position in the view
    rotation: number  // clockwise rotation in degrees
    mirrorX: boolean
    mirrorY: boolean

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
    ) {
        super(depth)
        this.source = source
        this.sourcePosition = sourcePosition, 
        this.sourceDimensions = sourceDimensions
        this.position = position
        this.dimensions = dimensions
        this.rotation = rotation
        this.mirrorX = mirrorX,
        this.mirrorY = mirrorY
    }

    render(context: RenderContext) {
        const pixelPerfect = false  // TODO make this work properly

        context.drawImage(
            this.source, 
            this.sourcePosition, 
            this.sourceDimensions, 
            this.position,
            this.dimensions,
            this.rotation,
            pixelPerfect,
            this.mirrorX,
            this.mirrorY
        )
    }
}
