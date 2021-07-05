import { Point } from "../Point"
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
}
