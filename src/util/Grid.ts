import { Point } from "../Point"
import { BinaryHeap } from "./BinaryHeap"

// an infinite grid using x/y coordinates (x increases to the right, y increases down)
export class Grid<T> {
    private _map: { [key: string]: T } = {}
    private _valuesCache: T[] // calling Object.values() repeatedly is expensive

    set(pt: Point, entry: T) {
        this._valuesCache = null
        this._map[pt.toString()] = entry
    }

    /**
     * @returns the element at the point or null if not present in the grid
     */
    get(pt: Point): T {
        return this._map[pt.toString()]
    }

    remove(pt: Point) {
        this._valuesCache = null
        delete this._map[pt.toString()]
    }

    removeAll(element: T) {
        this._valuesCache = null
        Object.entries(this._map)
            .filter((kv) => kv[1] === element)
            .forEach((kv) => delete this._map[kv[0]])
    }

    clear() {
        this._map = {}
        this._valuesCache = null
    }

    map<V>(fn: (value: T) => V): Grid<V> {
        const result = new Grid<V>()
        this.entries().forEach(([pt, val]) => {
            result.set(pt, fn(val))
        })
        return result
    }

    filter(fn: (val: T, pt?: Point) => boolean): Grid<T> {
        const result = new Grid<T>()
        this.entries().forEach(([pt, val]) => {
            if (fn(val, pt)) {
                result.set(pt, val)
            }
        })
        return result
    }

    /**
     * This requires parsing all keys and can be expensive if done frequently
     */
    entries(): [Point, T][] {
        return Object.entries(this._map).map((tuple) => [Point.fromString(tuple[0]), tuple[1]])
    }

    /**
     * This requires parsing all keys and can be expensive if done frequently
     */
    keys(): Point[] {
        return Object.keys(this._map).map((ptStr) => Point.fromString(ptStr))
    }

    /**
     * @returns a set of all unique values in the grid
     */
    values(): T[] {
        if (!this._valuesCache) {
            this._valuesCache = Array.from(new Set(Object.values(this._map)))
        }
        return this._valuesCache
    }

    /**
     * @returns a path inclusive of start and end
     */
    findPath(
        start: Point,
        end: Point,
        {
            heuristic = (pt) => pt.manhattanDistanceTo(end),
            distance = (a, b) => a.manhattanDistanceTo(b),
            isOccupied = (pt) => !!this.get(pt),
            getNeighbors = (pt) => [
                new Point(pt.x, pt.y - 1),
                new Point(pt.x - 1, pt.y),
                new Point(pt.x + 1, pt.y),
                new Point(pt.x, pt.y + 1),
            ],
            shortCircuit = Number.MAX_SAFE_INTEGER,
        }: {
            heuristic?: (pt: Point) => number
            distance?: (a: Point, b: Point) => number
            isOccupied?: (pt: Point) => boolean
            getNeighbors?: (pt: Point) => Point[]
            shortCircuit?: number
        } = {}
    ): Point[] {
        // TODO: Support bidirectional pathfinding

        if (isOccupied(start) || isOccupied(end) || start.equals(end)) {
            return null
        }

        return this.findPathInternal(
            start,
            end,
            heuristic,
            distance,
            isOccupied,
            getNeighbors,
            shortCircuit
        )
    }

    private findPathInternal(
        start: Point,
        end: Point,
        heuristic: (pt: Point) => number,
        distance: (a: Point, b: Point) => number,
        isOccupied: (pt: Point) => boolean,
        getNeighbors: (pt: Point) => Point[],
        shortCircuit: number
    ): Point[] {
        const gScore = new Map<string, number>()
        gScore.set(start.toString(), 0)

        const fScore = new Map<string, number>()
        fScore.set(start.toString(), 0)

        const cameFrom = new Map<string, Point>()
        const openSetUnique = new Set<string>()
        const openSet = new BinaryHeap<Point>((p) => fScore.get(p.toString()))
        openSet.push(start)

        while (openSet.size() > 0) {
            const current = openSet.pop()
            openSetUnique.delete(current.toString())

            if (current.equals(end)) {
                const path = []
                let next = current
                while (next) {
                    path.push(next)
                    next = cameFrom.get(next.toString())
                }
                return path.reverse()
            }

            const currentGScore = gScore.get(current.toString())

            const neighbors = getNeighbors(current).filter(
                (pt) => !isOccupied(pt) && !pt.equals(start)
            )

            for (const neighbor of neighbors) {
                const n = neighbor.toString()
                const tentativeGScore = currentGScore + distance(current, neighbor)
                const currentNeighborGScore = gScore.get(n)
                if (!currentNeighborGScore || tentativeGScore < currentNeighborGScore) {
                    cameFrom.set(n, current)
                    gScore.set(n, tentativeGScore)
                    fScore.set(n, tentativeGScore + heuristic(neighbor))
                    if (!openSetUnique.has(n)) {
                        openSet.push(neighbor)
                        openSetUnique.add(n)
                    }
                }
            }

            if (cameFrom.size > shortCircuit) {
                return null
            }
        }

        return null
    }

    /**
     * Returns a copy of the grid where the contents are
     * repositioned with the top left starting at (0, 0)
     */
    normalized(): Grid<T> {
        const entries = this.entries()
        const result = new Grid<T>()
        if (entries.length === 0) {
            return result
        }
        const minX = Math.min(...entries.map((entry) => entry[0].x))
        const minY = Math.min(...entries.map((entry) => entry[0].y))
        const shift = new Point(-minX, -minY)
        for (const entry of entries) {
            result.set(entry[0].plus(shift), entry[1])
        }
        return result
    }

    serialize(): { [key: string]: T } {
        return this._map
    }

    /**
     * Searches for something that matches the filter in a square clockwise spiral pattern
     *  --->
     * ^    |
     * |    v
     *  <---
     * @param center the center point
     * @returns the first point matching the filter, searching outward
     */
    static spiralSearch(
        center: Point,
        filter: (pt: Point) => boolean,
        range: number = 100
    ): Point | undefined {
        for (let i = 1; i < range; i++) {
            const top = center.y - i
            const right = center.x + i
            const bottom = center.y + i
            const left = center.x - i

            // top
            for (let x = left; x < right; x++) {
                if (filter(new Point(x, top))) {
                    return new Point(x, top)
                }
            }
            // right
            for (let y = top; y < bottom; y++) {
                if (filter(new Point(right, y))) {
                    return new Point(right, y)
                }
            }
            // bottom
            for (let x = right; x > left; x--) {
                if (filter(new Point(x, top))) {
                    return new Point(x, top)
                }
            }
            // left
            for (let y = bottom; y > top; y--) {
                if (filter(new Point(left, y))) {
                    return new Point(left, y)
                }
            }
        }
    }

    static deserialize<T>(map: { [key: string]: T }): Grid<T> {
        const g = new Grid<T>()
        g._map = map
        return g
    }
}
