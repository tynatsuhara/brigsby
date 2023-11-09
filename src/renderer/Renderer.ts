import { debug } from "../Debug"
import { Point } from "../Point"
import { measure, profiler } from "../Profiler"
import { View } from "../View"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"

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
        // focusing adds an ugly outline, so automatically blur
        canvas.onfocus = () => canvas.blur()

        // the transform origin should match our coordinate system where top left is (0, 0)
        canvas.style.transformOrigin = "top left"
        // prevent touchscreen manipulation
        canvas.style.touchAction = "none"

        this.canvas = canvas
        this.context = canvas.getContext("2d", { alpha: true })

        this.options = options

        this.resizeCanvas()
    }

    _render(views: View[]) {
        this.resizeCanvas()
        this.context.imageSmoothingEnabled = false
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        views.forEach((v, i) => this.renderView(v, i))
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

    private renderView(view: View, viewIndex: number) {
        const viewRenderContext = new RenderContext(this.canvas, this.context, view)
        const renders: RenderMethod[] = []

        // Don't use anonymous functions, that way they show up in the profiler
        const aggregate = () => {
            for (const e of view.entities) {
                for (const c of e?.components) {
                    if (c?.enabled && c?.isStarted) {
                        for (const r of c.getRenderMethods()) {
                            if (r) {
                                renders.push(r)
                            }
                        }
                    }
                }
            }
        }
        const sort = () => {
            renders.sort((a, b) => a.depth - b.depth)
        }
        const render = () => {
            renders.forEach((renderMethod) => renderMethod.render(viewRenderContext))
        }

        const [aggregateTime] = measure(aggregate)
        const [sortTime] = measure(sort)
        const [renderTime] = measure(render)

        if (debug.showRenderStats) {
            profiler.customTrackMovingAverage(`view-${viewIndex}-aggregateTime`, aggregateTime)
            profiler.customTrackMovingAverage(`view-${viewIndex}-sortTime`, sortTime)
            profiler.customTrackMovingAverage(`view-${viewIndex}-renderTime`, renderTime)
            profiler.customTrackMovingAverage(`view-${viewIndex}-renderCount`, renders.length)
        }
    }
}

export const renderer = new Renderer()
