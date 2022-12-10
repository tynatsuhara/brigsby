import { UpdateViewsContext } from "./Engine"
import { View } from "./View"

export abstract class Scene {
    /**
     * Called before each update cycle. The entities contained in these
     * views will be updated and rendered during the next update cycle
     */
    abstract getViews(updateViewsContext: UpdateViewsContext): View[]
}
