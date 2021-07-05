import { View } from "./View"
import { Entity } from "./Entity"
import { Point } from "./Point"
import { TextRender } from "./renderer/TextRender"
import { Component } from "./Component"
import { BasicRenderComponent } from "./renderer/BasicRenderComponent"

class Profiler {
    private fpsTracker = new MovingAverage()
    private updateTracker = new MovingAverage()
    private renderTracker = new MovingAverage()
    private lateUpdateTracker = new MovingAverage()
    private componentsUpdated: number

    private tracked = new Map<string, [MovingAverage, (number) => string]>()

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
    }

    customTrackMovingAverage(key: string, value: number, displayFn: (number) => string) {
        let tracker = this.tracked.get(key)
        if (!tracker) {
            tracker = [new MovingAverage(), displayFn]
            this.tracked.set(key, tracker)
        }
        tracker[0].record(value)
    }

    getView(): View {
        const s = [
            `FPS: ${round(1000/this.fpsTracker.get())} (${round(this.fpsTracker.get())} ms per frame)`,
            `update() duration ms: ${round(this.updateTracker.get(), 2)}`,
            `render() duration ms: ${round(this.renderTracker.get(), 2)}`,
            `lateUpdate() duration ms: ${round(this.lateUpdateTracker.get(), 2)}`,
            `components updated: ${this.componentsUpdated}`,
            ...Array.from(this.tracked.values()).map((v => v[1](v[0].get())))
        ]
        return {
            entities: [new Entity(s.map((str, i) => new BasicRenderComponent(new TextRender(str, new Point(60, 70 + 25 * i)))))],
            zoom: 1,
            offset: Point.ZERO
        }
    }
}

const round = (val, pow=0) => {
    const decimals = Math.pow(10, pow)
    return Math.round(val * decimals)/decimals
}

class MovingAverage {
    pts: [number, number][] = []
    sum = 0
    lifetime = 1  // in seconds

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
        return this.sum/this.pts.length
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