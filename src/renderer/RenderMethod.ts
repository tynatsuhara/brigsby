import { RenderContext } from "./RenderContext"

export abstract class RenderMethod {
    depth: number

    constructor(depth: number) {
        this.depth = depth
    }

    abstract render(context: RenderContext): void
}
