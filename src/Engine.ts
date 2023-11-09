import { collisionEngine } from "./collision/CollisionEngine"
import { ALREADY_STARTED_COMPONENT } from "./Component"
import { debug } from "./Debug"
import { Game } from "./Game"
import { CanvasInput, CapturedInput } from "./Input"
import { Point } from "./Point"
import { measure, profiler } from "./Profiler"
import { CanvasOptions, renderer } from "./renderer/Renderer"
import { Maths } from "./util/Maths"
import { View } from "./View"

const MINIMUM_ALLOWED_FPS = 15
const MIN_ELAPSED_MILLIS = 1
const MAX_ELAPSED_MILLIS = 1000 / MINIMUM_ALLOWED_FPS

export class UpdateViewsContext {
    readonly elapsedTimeMillis: number
}

// Models for component updates
export class AwakeData {}
export class StartData {
    readonly dimensions: Point
}
export class UpdateData {
    readonly view: View
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
    /**
     * Each update cycle, this increments by 1. The initial value is 1.
     */
    readonly tick: number
}

export class Engine {
    private readonly game: Game
    private readonly input: CanvasInput
    private tickCounter = 1

    private lastUpdateMillis = new Date().getTime()

    static start(game: Game, canvas: HTMLCanvasElement, canvasOptions: CanvasOptions = {}) {
        if (!game) {
            throw new Error("game cannot be null")
        }
        if (!canvas) {
            throw new Error("canvas cannot be null")
        }
        new Engine(game, canvas, canvasOptions)
    }

    private constructor(game: Game, canvas: HTMLCanvasElement, canvasOptions: CanvasOptions) {
        this.game = game
        this.input = new CanvasInput(canvas)
        renderer._setCanvas(canvas, canvasOptions)
        profiler._mount(canvas.parentElement)

        this.game.initialize()

        this.tick = this.tick.bind(this)

        requestAnimationFrame(this.tick)
    }

    private tick() {
        const time = new Date().getTime()

        // Because of JS being suspended in the background, elapsed may become
        // really high, so we need to limit it with MAX_ELAPSED_MILLIS.
        // This means that visual lag can happen if fps < MINIMUM_ALLOWED_FPS.
        // We also want elapsed to always be > 0, which will occasionally not
        // be true, especially on the first update of a game.
        const elapsedTimeMillis = Maths.clamp(
            time - this.lastUpdateMillis,
            MIN_ELAPSED_MILLIS,
            MAX_ELAPSED_MILLIS
        )
        const input = this.input._captureInput()

        const updateViewsContext: UpdateViewsContext = {
            elapsedTimeMillis,
        }

        const scene = this.game.scene
        const views = this.game.scene.getViews(updateViewsContext)
        collisionEngine._setViewContext(views)

        /**
         * we want to short circuit updates if the game scene changes at any point
         */
        const isSafeToProceed = () => this.game.scene === scene

        let componentsUpdated = 0

        const update = () => {
            for (const v of views) {
                if (!isSafeToProceed()) {
                    break
                }

                v.entities = v.entities.filter((e) => !!e)

                const dimensions = renderer.getDimensions().div(v.zoom)
                const startData: StartData = {
                    dimensions,
                }
                const updateData: UpdateData = {
                    view: v,
                    elapsedTimeMillis,
                    input: input._scaledForView(v),
                    dimensions,
                    tick: this.tickCounter,
                }

                // Behavior where an entity belongs to multiple views is undefined (revisit later, eg for splitscreen)
                for (const e of v.entities) {
                    if (isSafeToProceed()) {
                        for (const c of e.components) {
                            if (isSafeToProceed() && c.enabled && c.entity) {
                                if (!c.isStarted) {
                                    c.start(startData)
                                    c.start = ALREADY_STARTED_COMPONENT
                                }
                                c.update(updateData)
                                componentsUpdated++
                            }
                        }
                    }
                }
            }
        }
        const [updateDuration] = measure(update)

        const render = () => {
            renderer._render(views)
        }
        const [renderDuration] = measure(render)

        const lateUpdate = () => {
            for (const v of views) {
                if (!isSafeToProceed()) {
                    break
                }

                const updateData: UpdateData = {
                    view: v,
                    elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                    input: input._scaledForView(v),
                    dimensions: renderer.getDimensions().div(v.zoom),
                    tick: this.tickCounter,
                }

                for (const e of v.entities) {
                    if (isSafeToProceed()) {
                        for (const c of e.components) {
                            if (isSafeToProceed() && c.enabled && c.entity) {
                                c.lateUpdate(updateData)
                            }
                        }
                    }
                }
            }
        }
        const [lateUpdateDuration] = measure(lateUpdate)

        if (debug.showProfiler) {
            profiler._updateEngineTickStats(
                elapsedTimeMillis,
                updateDuration,
                renderDuration,
                lateUpdateDuration,
                componentsUpdated
            )
            profiler._flush()
        } else {
            profiler._hide()
        }

        this.lastUpdateMillis = time
        this.tickCounter++

        requestAnimationFrame(this.tick)
    }
}
