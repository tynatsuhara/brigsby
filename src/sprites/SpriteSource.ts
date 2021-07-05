import { SpriteComponent } from "./SpriteComponent"
import { SpriteTransform } from "./SpriteTransform"

export interface SpriteSource {
    toComponent(): SpriteComponent
    toComponent(transform: SpriteTransform): SpriteComponent
    filtered(filter: (img: ImageData) => ImageData): SpriteSource
}