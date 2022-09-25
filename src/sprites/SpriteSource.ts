import { SpriteComponent } from "./SpriteComponent"
import { SpriteTransform } from "./SpriteTransform"

export type ImageFilter = (img: ImageData) => ImageData

export interface SpriteSource {
    toComponent(): SpriteComponent
    toComponent(transform: SpriteTransform): SpriteComponent
    filtered(filter: ImageFilter): SpriteSource
}
