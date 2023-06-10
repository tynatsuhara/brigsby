import { Point } from "../Point"
import { AsyncRenderer } from "./AsyncRenderer"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"

export class EllipseRender extends RenderMethod {
    position: Point
    dimensions: Point
    color: string

    /**
     * @param position the top left position of the ellipse
     * @param dimensions the diameters along the x and y axes
     */
    constructor({
        depth = 0,
        position = Point.ZERO,
        dimensions = Point.ZERO,
        color = "#ff0000",
    }: {
        depth?: number
        position?: Point
        dimensions?: Point
        color?: string
    } = {}) {
        super(depth)
        this.position = position
        this.dimensions = dimensions
        this.color = color
    }

    render(context: RenderContext): void {
        context.fillStyle = this.color
        context.fillEllipse(this.position, this.dimensions)
    }

    renderAsync(renderer: AsyncRenderer): void {
        renderer.post({
            t: "e",
            d: this.depth,
            px: this.position.x,
            py: this.position.y,
            dx: this.dimensions.x,
            dy: this.dimensions.y,
            c: this.color,
        })
    }
}
