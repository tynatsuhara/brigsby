import { Point } from "../Point"
import { View } from "../View"
import { RenderContext } from "./RenderContext"

export type CanvasOptions = {
    scale?: number
}

class Renderer {
    private canvas: HTMLCanvasElement
    private scale: number
    private context: CanvasRenderingContext2D

    getDimensions(): Point {
        return new Point(this.canvas.width, this.canvas.height).div(this.scale)
    }

    getScale() {
        return this.scale
    }

    _setCanvas(canvas: HTMLCanvasElement, { scale = 1 }: CanvasOptions) {
        // the transform origin should match our coordinate system where top left is (0, 0)
        canvas.style.transformOrigin = "top left"
        canvas.style.transform = `scale(${scale})`
        this.scale = scale

        this.canvas = canvas
        this.context = canvas.getContext("2d", { alpha: true })

        this.resizeCanvas()
    }

    _render(views: View[]) {
        this.resizeCanvas()
        this.context.imageSmoothingEnabled = false
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        views.forEach((v) => this.renderView(v))
    }

    private resizeCanvas() {
        // make sure stuff doesn't get stretched
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
    }

    private renderView(view: View) {
        const viewRenderContext = new RenderContext(this.canvas, this.context, view)
        view.entities
            .flatMap((entity) => entity?.components)
            .filter((component) => !!component && component.enabled && component.isStarted)
            .flatMap((component) => component.getRenderMethods())
            .filter((render) => !!render)
            .sort((a, b) => a.depth - b.depth) // TODO possibly improve this
            .forEach((renderMethod) => renderMethod.render(viewRenderContext))
    }
}

export const renderer = new Renderer()
