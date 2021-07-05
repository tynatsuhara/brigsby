import { Point } from "../Point"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"

export class RectRender extends RenderMethod {
    position: Point
    dimensions: Point
    color: string

    constructor(
        { depth = 0, position = Point.ZERO, dimensions = Point.ZERO, color = "#ff0000" }: 
        { depth?: number, position?: Point, dimensions?: Point, color?: string } = {}
    ) {
        super(depth)
        this.position = position
        this.dimensions = dimensions
        this.color = color
    }

    render(context: RenderContext): void {
        context.fillStyle = this.color;
        context.fillRect(this.position, this.dimensions)
    }
}
