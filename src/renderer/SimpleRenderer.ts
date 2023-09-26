import { View } from "../View"
import { RenderContext } from "./RenderContext"
import { RendererImpl } from "./RendererImpl"

export class SimpleRenderer implements RendererImpl {
    private readonly context: CanvasRenderingContext2D

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.context = canvas.getContext("2d", { alpha: true })
    }

    renderViews(views: View[]): void {
        views.forEach((view) => {
            const viewRenderContext = new RenderContext(
                this.canvas,
                this.context,
                view.zoom,
                view.offset
            )
            view.entities
                .flatMap((entity) => entity?.components)
                .filter((component) => !!component && component.enabled && component.isStarted)
                .flatMap((component) => component.getRenderMethods())
                .filter((render) => !!render)
                .sort((a, b) => a.depth - b.depth) // TODO possibly improve this
                .forEach((renderMethod) => renderMethod.render(viewRenderContext))
        })
    }
}
