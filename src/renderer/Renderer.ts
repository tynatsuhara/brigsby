import { Point } from "../Point"
import { View } from "../View"
import { RenderContext } from "./RenderContext"

class Renderer {

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    getDimensions(): Point {
        return new Point(this.canvas.width, this.canvas.height)
    }

    _setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext('2d', { alpha: true })
        this.resizeCanvas()
    }

    _render(views: View[]) {
        this.resizeCanvas()
        this.context.imageSmoothingEnabled = false
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        views.forEach(v => this.renderView(v))
    }

    private resizeCanvas() {
        // make sure stuff doesn't get stretched
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
    }

    private renderView(view: View) {
        const viewRenderContext = new RenderContext(this.canvas, this.context, view)
        view.entities
                .flatMap(entity => entity?.components)
                .filter(component => !!component && component.enabled && component.isStarted)
                .flatMap(component => component.getRenderMethods())
                .filter(render => !!render)
                .sort((a, b) => a.depth - b.depth)  // TODO possibly improve this
                .forEach(renderMethod => renderMethod.render(viewRenderContext))
    }
}

export const renderer = new Renderer()
