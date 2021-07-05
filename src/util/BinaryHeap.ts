// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)

export class BinaryHeap<T> {
    private content: T[] = []
    private scoreFunction: (x: T) => number

    constructor(scoreFunction: (x: T) => number) {
        this.scoreFunction = scoreFunction
    }

    clear() {
        this.content = []
    }

    pushAll(elements: T[]) {
        elements.forEach(item => this.push(item))
    }

    push(element: T) {
        this.content.push(element)
        this.bubbleUp(this.content.length - 1)
    }

    pop(): T {
        let result = this.content[0]
        let end = this.content.pop()
        if (this.content.length > 0) {
            this.content[0] = end
            this.sinkDown(0)
        }
        return result
    }

    peek(): T {
        if (this.content.length === 0) {
            throw new Error("cannot call peek() on an empty heap")
        }
        return this.content[0]
    }

    remove(node: T) {
        let length = this.content.length
        // To remove a value, we must search through the array to find it.
        for (var i = 0; i < length; i++) {
            if (this.content[i] != node) continue
            // When it is found, the process seen in 'pop' is repeated to fill up the hole.
            let end = this.content.pop()
            // If the element we popped was the one we needed to remove, we're done.
            if (i == length - 1) break
            // Otherwise, we replace the removed element with the popped one, 
            // and allow it to float up or sink down as appropriate.
            this.content[i] = end
            this.bubbleUp(i)
            this.sinkDown(i)
            break
        }
    }

    size() {
        return this.content.length
    }

    getContents(sorted: boolean = false) {
        const copy = [...this.content]
        if (sorted) {
            copy.sort(this.scoreFunction)
        }
        return copy
    }

    private bubbleUp(n: number) {
        // Fetch the element that has to be moved.
        let element = this.content[n], score = this.scoreFunction(element)
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            let parentN = Math.floor((n + 1) / 2) - 1,
                parent = this.content[parentN]
            // If the parent has a lesser score, things are in order and we are done.
            if (score >= this.scoreFunction(parent))
                break

            // Otherwise, swap the parent with the current element and continue.
            this.content[parentN] = element
            this.content[n] = parent
            n = parentN
        }
    }

    private sinkDown(n: number) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element)

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) * 2, child1N = child2N - 1
            // This is used to store the new position of the element, if any.
            var swap = null
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N],
                    child1Score = this.scoreFunction(child1)
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2)
                if (child2Score < (swap == null ? elemScore : child1Score))
                    swap = child2N
            }

            // No need to swap further, we are done.
            if (swap == null) break

            // Otherwise, swap and continue.
            this.content[n] = this.content[swap]
            this.content[swap] = element
            n = swap
        }
    }
} 