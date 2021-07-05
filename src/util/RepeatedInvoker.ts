import { Component } from "../Component"
import { UpdateData } from "../Engine"

/**
 * A utility component for executing functions at random intervals.
 * The invoked function runs in the update() step.
 */
export class RepeatedInvoker extends Component {

    private fn: (updateData: UpdateData) => number
    private delay: number

    /**
     * @param fn The function to execute. Returns the delay (in milliseconds) until the next invocation.
     * @param initialDelay The delay before the function executes for the first time.
     */
    constructor(fn: (updateData: UpdateData) => number, initialDelay = 0) {
        super()
        this.fn = fn
        this.delay = initialDelay
    }

    update(updateData: UpdateData) {
        this.delay -= updateData.elapsedTimeMillis
        if (this.delay < 0) {
            this.delay = this.fn(updateData)
        }
    }
}