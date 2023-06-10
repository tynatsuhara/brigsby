import { AsyncRenderer } from "./AsyncRenderer"
import { RenderContext } from "./RenderContext"

export abstract class RenderMethod {
    depth: number

    constructor(depth: number) {
        this.depth = depth
    }

    // TODO consolidate these with a unified renderer interface so we can just swap out the renderer
    abstract render(context: RenderContext): void
    abstract renderAsync(renderer: AsyncRenderer): void
}
