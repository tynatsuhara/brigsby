export class Animator {    
    paused: boolean 
    private readonly frames: number[]  // a list of end-of-frame timestamps
    private readonly duration: number  // total duration

    // callbacks
    private readonly onFrameChange: (index: number) => void
    private readonly onFinish: () => void  // called when the last frame finishes

    private time: number = 0
    private index: number = 0

    /**
     * @param frames A list of frame durations
     * @param fn A callback that will be called each time a frame changes, passing the zero-based frame index
     */
    constructor(
        frames: number[], 
        onFrameChange: (index: number) => void = () => {},
        onFinish: () => void = () => {},
    ) {
        this.onFrameChange = onFrameChange
        this.onFinish = onFinish

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
        if (this.paused) {
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