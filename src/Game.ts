import { View } from "./View"
import { UpdateViewsContext } from "./Engine"

export abstract class Game {
    /**
     * Called after the engine has been started, before getViews is called
     */
    initialize() {}

    /**
     * Called before each update cycle. The entities contained in these
     * views will be updated and rendered during the next update cycle
     */
    abstract getViews(updateViewsContext: UpdateViewsContext): View[]
}
