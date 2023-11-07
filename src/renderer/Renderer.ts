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

        views.forEach((v, i) => {
            const stats = this.renderView(v)
            if (debug.showRenderStats) {
                profiler.customTrackMovingAverage(`view-${i}-aggregateTime`, stats.aggregateTime)
                profiler.customTrackMovingAverage(`view-${i}-sortTime`, stats.sortTime)
                profiler.customTrackMovingAverage(`view-${i}-renderTime`, stats.renderTime)
                profiler.customTrackMovingAverage(`view-${i}-renderCount`, stats.renderCount)
            }
        })
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
        const renders: RenderMethod[] = []
        const [aggregateTime] = measure(() => {
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
        })
        const [sortTime] = measure(() => {
            renders.sort((a, b) => a.depth - b.depth)
        })
        const [renderTime] = measure(() => {
            renders.forEach((renderMethod) => renderMethod.render(viewRenderContext))
        })
        return { aggregateTime, sortTime, renderTime, renderCount: renders.length }
    }
}

export const renderer = new Renderer()
