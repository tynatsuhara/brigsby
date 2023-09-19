export class Animator {
    paused: boolean
    private readonly frames: number[] // a list of end-of-frame timestamps
    private readonly duration: number // total duration

    private time: number = 0
    private index: number = 0

    /**
     * @param frames A list of frame durations
     * @param onFrameChange A callback that will be called each time a frame changes, passing the zero-based frame index
     * @param onFinish A callback that will be called at the end of the animation. Set paused=true in this callback to stop the animation at the end.
     * @param pauseSupplier A supplier function which will be OR'd with the paused field. Useful for pausing all animations when the game is paused.
     */
    constructor(
        frames: number[],
        private readonly onFrameChange: (index: number) => void = () => {},
        private readonly onFinish: () => void = () => {},
        private readonly pauseSupplier: () => boolean = () => false
    ) {
        this.frames = []
        let durationSoFar = 0
        frames.forEach((frameDuration: number) => {
            durationSoFar += frameDuration
            this.frames.push(durationSoFar)
        })
        this.duration = durationSoFar

        this.onFrameChange(0)
    }

    update(elapsedTimeMillis: number) {
        if (this.paused || this.pauseSupplier()) {
            return
        }
        this.time += elapsedTimeMillis
        while (this.time > this.frames[this.index]) {
            this.index++

            if (this.index === this.frames.length) {
                this.onFinish()
                // the onFinish callback might pause the animator, so check again
                if (this.paused) {
                    return
                }
            }

            this.index %= this.frames.length
            this.time %= this.duration
            this.onFrameChange(this.index)
        }
    }

    getCurrentFrame(): number {
        return this.index
    }

    setCurrentFrame(f: number) {
        if (f < 0 || f >= this.frames.length) {
            throw new Error("invalid frame")
        }
        this.index = f
    }

    static frames(count: number, msPerFrame: number) {
        const result = []
        for (let i = 0; i < count; i++) {
            result.push(msPerFrame)
        }
        return result
    }
}
