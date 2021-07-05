import { View } from "./View"
import { UpdateViewsContext } from "./Engine"

export abstract class Game {

    initialize() {}

    abstract getViews(updateViewsContext: UpdateViewsContext): View[]
}