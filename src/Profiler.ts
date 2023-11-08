class Profiler {
    private fpsTracker = new MovingAverage()
    private updateTracker = new MovingAverage()
    private renderTracker = new MovingAverage()
    private lateUpdateTracker = new MovingAverage()
    private componentsUpdated: number

    private tracked = new Map<string, [MovingAverage, (number) => string]>()

    private shownInfo: string[] = []
    private displayed: string[] = []

    private element: HTMLDivElement

    _mount(parentElement: HTMLElement) {
        this.element = document.createElement("div")
        this.element.className = "brigsby-profiler"
        this.element.style.color = "white"
        this.element.style.zIndex = "1000000"
        this.element.style.position = "absolute"
        this.element.style.background = "#0000007F"
        this.element.style.width = "100%"
        this.element.style.userSelect = "none"
        this.element.style.pointerEvents = "none"
        this.element.style.font = "message-box"
        this.element.style.padding = "6px"
        parentElement.appendChild(this.element)
    }

    _flush() {
        this.element.style.display = "block"
        this.element.innerHTML = this.displayed.join("<br/>")
    }

    _hide() {
        this.element.style.display = "none"
    }

    _updateEngineTickStats(
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

    customTrackMovingAverage(
        key: string,
        value: number,
        displayFn: (num: number) => string = (n) => `${key}: ${Math.round(100 * n) / 100}`
    ) {
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
