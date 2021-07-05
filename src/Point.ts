export class Point {

    static readonly ZERO = new Point(0, 0)

    // relative to top left corner
    readonly x: number
    readonly y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    times(multiplier: number): Point {
        return new Point(this.x * multiplier, this.y * multiplier)
    }

    div(denominator: number): Point {
        return new Point(this.x / denominator, this.y / denominator)
    }

    floorDiv(denominator: number): Point {
        return new Point(
            Math.floor(this.x / denominator), 
            Math.floor(this.y / denominator)
        )
    }

    plus(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y)
    }

    plusX(dx: number): Point {
        return new Point(this.x + dx, this.y)
    }

    plusY(dy: number): Point {
        return new Point(this.x, this.y + dy)
    }

    minus(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y)
    }

    lerp(multiplier: number, goal: Point): Point {
        const clampedMultiplier = Math.max(Math.min(multiplier, 1), 0)
        return this.plus(goal.minus(this).times(clampedMultiplier))
    }

    distanceTo(pt: Point): number {
        const dx = pt.x - this.x
        const dy = pt.y - this.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    manhattanDistanceTo(pt: Point): number {
        return Math.abs(pt.x - this.x) + Math.abs(pt.y - this.y)
    }

    magnitude(): number {
        return this.distanceTo(new Point(0, 0))
    }

    normalized(): Point {
        const mag = this.magnitude()
        if (mag === 0) {
            throw new Error("cannot normalize a vector with magnitude 0")
        }
        return this.div(mag)
    }

    toString(): string {
        return `(${this.x},${this.y})`
    }

    /**
     * Parses a string of the format "(x,y)"
     * Behavior is undefined when the paramter is incorrectly formatted.
     */
    static fromString(s: string) : Point {
        const halves = s.replace("(", "").replace(")", "").split(",").map(n => Number.parseInt(n))
        return new Point(halves[0], halves[1])
    }

    equals(pt: Point) {
        return pt && pt.x == this.x && pt.y == this.y
    }

    apply(fn: (n: number) => number) {
        return new Point(fn(this.x), fn(this.y))
    }

    /**
     * Returns a new point which has been slightly shifted a random amount
     * @param xRandom The new x will be shifted a relative distance of [-xRandom, xRandom]
     * @param yRandom The new y will be shifted a relative distance of [-yRandom, yRandom]
     *                If omitted, this will be the same as xRandom
     */
    randomlyShifted(xRandom: number, yRandom: number = xRandom) {
        return this.plus(new Point(xRandom - Math.random() * xRandom * 2, yRandom - Math.random() * yRandom * 2))
    }

    /**
     * Returns this point shifted by a random value inside a circle with the given radius
     */
    randomCircularShift(radius: number) {
        const a = Math.random() * 2 * Math.PI
        const r = radius * Math.sqrt(Math.random())
        return this.plus(new Point(r * Math.cos(a), r * Math.sin(a)))
    }
}