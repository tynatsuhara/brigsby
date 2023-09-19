import { Component } from "../Component"
import { UpdateData } from "../Engine"

/**
 * A utility component for executing functions at random intervals.
 * The invoked function runs in the update() step.
 */
export class RepeatedInvoker extends Component {
    private delay: number
    private execution = 0

    /**
     * @param fn The function to execute. Returns the delay (in milliseconds) until the next invocation.
     * @param initialDelay The delay before the function executes for the first time.
     */
    constructor(
        private readonly fn: (updateData: UpdateData, execution: number) => number,
        initialDelay = 0,
        private readonly pauseSupplier: () => boolean = () => false
    ) {
        super()
        this.delay = initialDelay
    }

    update(updateData: UpdateData) {
        if (this.pauseSupplier()) {
            return
        }

        this.delay -= updateData.elapsedTimeMillis
        if (this.delay < 0) {
            this.delay = this.fn(updateData, this.execution)
            this.execution++
        }
    }
}

export class LateRepeatedInvoker extends RepeatedInvoker {
    constructor(
        fn: (updateData: UpdateData, execution: number) => number,
        initialDelay = 0,
        pauseSupplier: () => boolean = () => false
    ) {
        super(fn, initialDelay, pauseSupplier)
        this.lateUpdate = this.update
        this.update = () => {}
    }
}
