import { View } from "../View"

export interface RendererImpl {
    renderViews(views: View[]): void
}
