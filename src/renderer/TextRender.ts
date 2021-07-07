import { Point } from "../Point"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"

export class TextRender extends RenderMethod {
    text: string
    position: Point  // top-left
    size: number
    font: string
    color: string
    alignment: CanvasTextAlign

    constructor(
        text: string, 
        position: Point, 
        fontSizePx: number = 20,
        font: string = "Comic Sans MS Regular", 
        color: string = "red",
        depth: number = 0,
        alignment: CanvasTextAlign = "start",
    ) {
        super(depth)
        this.text = text
        this.position = position
        this.size = fontSizePx
        this.font = font
        this.color = color
        this.alignment = alignment
    }

    render(context: RenderContext): void {
        context.fillText(this.size, this.font, this.color, this.text, this.position, this.alignment)
    }
}
