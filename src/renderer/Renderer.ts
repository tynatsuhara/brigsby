import { Point } from "../Point"
import { View } from "../View"
import { RenderContext } from "./RenderContext"

export type CanvasOptions = {
    scale?: number
    fixedHeight?: number
}

class Renderer {
    private canvas: HTMLCanvasElement
    private options: CanvasOptions
    private scale: number = 1
    private context: CanvasRenderingContext2D

    getDimensions(): Point {
        return new Point(this.canvas.width, this.canvas.height)
    }

    getScale() {
        return this.scale
    }

    _setCanvas(canvas: HTMLCanvasElement, options: CanvasOptions) {
        // the transform origin should match our coordinate system where top left is (0, 0)
        canvas.style.transformOrigin = "top left"

        this.canvas = canvas
        this.context = canvas.getContext("2d", { alpha: true })

        this.options = options

        this.resizeCanvas()
    }

    _render(views: View[]) {
        this.resizeCanvas()
        this.context.imageSmoothingEnabled = false
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        views.forEach((v) => this.renderView(v))
    }

    private resizeCanvas() {
        const { clientWidth, clientHeight } = this.canvas.parentElement
        const { scale, fixedHeight } = this.options

        if (scale) {
            this.scale = scale
        } else if (fixedHeight) {
            this.scale = clientHeight / fixedHeight
        }

        // make sure stuff doesn't get stretched
        this.canvas.style.transform = `scale(${this.scale})`
        this.canvas.style.width = `${clientWidth / this.scale}px`
        this.canvas.style.height = `${clientHeight / this.scale}px`
        this.canvas.width = clientWidth / this.scale
        this.canvas.height = clientHeight / this.scale
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
