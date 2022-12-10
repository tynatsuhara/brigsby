import { Scene } from "./Scene"

export abstract class Game {
    /**
     * The scene which will be rendered on the next tick.
     * If this changes, it aborts the current update cycle.
     */
    scene: Scene

    /**
     * Called after the engine has been started, before getViews is called
     */
    initialize() {}
}
