import { collisionEngine } from "./collision/CollisionEngine"
import { ALREADY_STARTED_COMPONENT } from "./Component"
import { debug } from "./Debug"
import { Game } from "./Game"
import { CapturedInput, Input } from "./Input"
import { Point } from "./Point"
import { measure, profiler } from "./Profiler"
import { renderer } from "./renderer/Renderer"
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
    private readonly input: Input
    private tickCounter = 1

    private lastUpdateMillis = new Date().getTime()

    static start(game: Game, canvas: HTMLCanvasElement) {
        if (!game) {
            throw new Error("game cannot be null")
        }
        if (!canvas) {
            throw new Error("canvas cannot be null")
        }
        new Engine(game, canvas)
    }

    private constructor(game: Game, canvas: HTMLCanvasElement) {
        this.game = game
        this.input = new Input(canvas)
        renderer._setCanvas(canvas)

        this.game.initialize()

        requestAnimationFrame(() => this.tick())
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
        const input = this.input.captureInput()

        const updateViewsContext: UpdateViewsContext = {
            elapsedTimeMillis,
        }

        const views = this.getViews(updateViewsContext)
        collisionEngine._setViewContext(views)

        let componentsUpdated = 0

        const [updateDuration] = measure(() => {
            views.forEach((v) => {
                v.entities = v.entities.filter((e) => !!e)

                const dimensions = renderer.getDimensions().div(v.zoom)
                const startData: StartData = {
                    dimensions,
                }
                const updateData: UpdateData = {
                    view: v,
                    elapsedTimeMillis,
                    input: input.scaledForView(v),
                    dimensions,
                    tick: this.tickCounter,
                }

                // Behavior where an entity belongs to multiple views is undefined (revisit later, eg for splitscreen)
                v.entities.forEach((e) =>
                    e.components.forEach((c) => {
                        if (!c.enabled) {
                            return
                        }
                        if (!c.isStarted) {
                            c.start(startData)
                            c.start = ALREADY_STARTED_COMPONENT
                        }
                        c.update(updateData)
                        componentsUpdated++
                    })
                )
            })
        })

        const [renderDuration] = measure(() => {
            renderer._render(views)
        })

        const [lateUpdateDuration] = measure(() => {
            views.forEach((v) => {
                const updateData: UpdateData = {
                    view: v,
                    elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                    input: input.scaledForView(v),
                    dimensions: renderer.getDimensions().div(v.zoom),
                    tick: this.tickCounter,
                }
                v.entities.forEach((e) =>
                    e.components.forEach((c) => {
                        c.lateUpdate(updateData)
                    })
                )
            })
        })

        if (debug.showProfiler) {
            profiler.updateEngineTickStats(
                elapsedTimeMillis,
                updateDuration,
                renderDuration,
                lateUpdateDuration,
                componentsUpdated
            )
        }

        this.lastUpdateMillis = time
        this.tickCounter++

        requestAnimationFrame(() => this.tick())
    }

    private getViews(context: UpdateViewsContext): View[] {
        return this.game.getViews(context).concat(debug.showProfiler ? [profiler.getView()] : [])
    }
}
