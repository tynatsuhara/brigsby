import { Component } from "../Component"
import { RenderMethod } from "./RenderMethod"

export class BasicRenderComponent extends Component {

    private readonly renders: RenderMethod[]

    constructor(...renders: RenderMethod[]) {
        super()
        this.renders = renders
    }

    getRenderMethods(): RenderMethod[] {
        return this.renders
    }
}