import { Point } from "../Point"
import { View } from "../View"
import { AsyncRenderer } from "./AsyncRenderer"
import { RendererImpl } from "./RendererImpl"
import { SimpleRenderer } from "./SimpleRenderer"

export type CanvasOptions = {
    scale?: number
    fixedHeight?: number
    renderWorkerScriptUrl?: string
}

class Renderer {
    private canvas: HTMLCanvasElement
    private options: CanvasOptions
    private scale: number = 1
    private context: CanvasRenderingContext2D
    private renderer: RendererImpl

    getDimensions(): Point {
        return new Point(this.canvas.width, this.canvas.height)
    }

    getScale() {
        return this.scale
    }

    _setCanvas(canvas: HTMLCanvasElement, options: CanvasOptions) {
        // focusing adds an ugly outline, so automatically blur
        canvas.onfocus = () => canvas.blur()

        // the transform origin should match our coordinate system where top left is (0, 0)
        canvas.style.transformOrigin = "top left"
        // prevent touchscreen manipulation
        canvas.style.touchAction = "none"

        this.canvas = canvas
        this.context = canvas.getContext("2d", { alpha: true })

        this.options = options

        this.renderer = options.renderWorkerScriptUrl
            ? new AsyncRenderer(canvas, this.context, options.renderWorkerScriptUrl)
            : new SimpleRenderer(canvas, this.context)

        this.resizeCanvas()
    }

    _render(views: View[]) {
        // this.resizeCanvas()
        this.context.imageSmoothingEnabled = false

        this.renderer.renderViews(views)
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
}

export const renderer = new Renderer()
