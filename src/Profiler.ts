import { Entity } from "./Entity"
import { Point, pt } from "./Point"
import { RectRender, renderer } from "./renderer"
import { BasicRenderComponent } from "./renderer/BasicRenderComponent"
import { TextRender } from "./renderer/TextRender"
import { View } from "./View"

class Profiler {
    public scale = 1

    private fpsTracker = new MovingAverage()
    private updateTracker = new MovingAverage()
    private renderTracker = new MovingAverage()
    private lateUpdateTracker = new MovingAverage()
    private componentsUpdated: number

    private tracked = new Map<string, [MovingAverage, (number) => string]>()

    private shownInfo: string[] = []
    private displayed: string[] = []

    updateEngineTickStats(
        msSinceLastUpdate: number,
        msForUpdate: number,
        msForRender: number,
        msForLateUpdate: number,
        componentsUpdated: number
    ) {
        this.fpsTracker.record(msSinceLastUpdate)
        this.updateTracker.record(msForUpdate)
        this.renderTracker.record(msForRender)
        this.lateUpdateTracker.record(msForLateUpdate)
        this.componentsUpdated = componentsUpdated

        this.displayed = [
            `FPS: ${round(1000 / this.fpsTracker.get())} (${round(
                this.fpsTracker.get()
            )} ms per frame)`,
            `update() duration ms: ${round(this.updateTracker.get(), 2)}`,
            `render() duration ms: ${round(this.renderTracker.get(), 2)}`,
            `lateUpdate() duration ms: ${round(this.lateUpdateTracker.get(), 2)}`,
            `components updated: ${this.componentsUpdated}`,
            ...Array.from(this.tracked.values()).map((v) => v[1](v[0].get())),
            ...this.shownInfo,
        ]

        this.shownInfo = []
    }

    customTrackMovingAverage(key: string, value: number, displayFn: (number) => string) {
        let tracker = this.tracked.get(key)
        if (!tracker) {
            tracker = [new MovingAverage(), displayFn]
            this.tracked.set(key, tracker)
        }
        tracker[0].record(value)
    }

    /**
     * @param str to display on the profiler output — this will be cleared after every update cycle
     */
    showInfo(str: string) {
        this.shownInfo.push(str)
    }

    getView(): View {
        const scale = (Math.round((1 / renderer.getScale()) * 10) / 10) * this.scale
        const lineHeight = 20
        const verticalPadding = 8
        const boxSize = pt(
            renderer.getDimensions().x / scale,
            lineHeight * this.displayed.length + 2 * verticalPadding
        )

        return {
            entities: [
                new Entity([
                    new BasicRenderComponent(
                        new RectRender({
                            depth: -1,
                            color: "#0000007F",
                            dimensions: boxSize,
                        })
                    ),
                    ...this.displayed.map(
                        (str, i) =>
                            new BasicRenderComponent(
                                new TextRender(
                                    str,
                                    pt(10, verticalPadding + lineHeight * i),
                                    16,
                                    "Arial",
                                    "white"
                                )
                            )
                    ),
                ]),
            ],
            zoom: scale,
            offset: Point.ZERO,
        }
    }
}

const round = (val: number, pow = 0) => {
    const decimals = Math.pow(10, pow)
    return Math.round(val * decimals) / decimals
}

class MovingAverage {
    pts: [number, number][] = []
    sum = 0
    lifetime = 1 // in seconds

    record(val: number) {
        const now = new Date().getTime()
        const expireThreshold = now - 1000 * this.lifetime
        while (this.pts.length > 0 && this.pts[0][0] < expireThreshold) {
            const old = this.pts.shift()
            this.sum -= old[1]
        }
        this.pts.push([now, val])
        this.sum += val
    }

    get(): number {
        return this.sum / this.pts.length
    }
}

export const profiler = new Profiler()

/**
 * Executes the given function and returns the milliseconds it took to execute as well as the result
 */
export function measure<T>(fn: () => T): [number, T] {
    const start = new Date().getTime()
    const result = fn()
    return [new Date().getTime() - start, result]
}
