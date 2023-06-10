import { Point } from "../Point"
import { AsyncRenderer } from "./AsyncRenderer"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"

export class LineRender extends RenderMethod {
    start: Point
    end: Point
    color: string
    width: number

    constructor(start: Point, end: Point, color: string = "#ff0000", width: number = 1) {
        super(Number.MAX_SAFE_INTEGER)
        this.start = start
        this.end = end
        this.color = color
        this.width = width
    }

    render(context: RenderContext): void {
        context.lineWidth = this.width
        context.strokeStyle = this.color
        context.beginPath()
        context.moveTo(this.start)
        context.lineTo(this.end)
        context.stroke()
    }

    renderAsync(renderer: AsyncRenderer): void {
        renderer.post({
            t: "l",
            d: this.depth,
            sx: this.start.x,
            sy: this.start.y,
            ex: this.end.x,
            ey: this.end.y,
            w: this.width,
            c: this.color,
        })
    }
}
