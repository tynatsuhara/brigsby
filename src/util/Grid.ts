import { Point } from "../Point"
import { BinaryHeap } from "./BinaryHeap"

// an infinite grid using x/y coordinates (x increases to the right, y increases down)
export class Grid<T> {
    // maps x -> y -> value
    private _map: Map<number, Map<number, T>> = new Map()

    private _entriesCache: [Point, T][]
    private _keysCache: Point[]
    private _valuesCache: T[]

    set({ x, y }: Point, entry: T) {
        this.clearCaches()
        if (!this._map.has(x)) {
            this._map.set(x, new Map())
        }
        this._map.get(x).set(y, entry)
    }

    /**
     * @returns the element at the point or null if not present in the grid
     */
    get({ x, y }: Point): T {
        return this._map.get(x)?.get(y)
    }

    remove({ x, y }: Point) {
        this.clearCaches()
        const xMap = this._map.get(x)
        if (xMap) {
            xMap.delete(y)
            if (xMap.size === 0) {
                this._map.delete(x)
            }
        }
    }

    removeAll(element: T) {
        this.clearCaches()
        this.entries().forEach(([point, value]) => {
            if (value === element) {
                this.remove(point)
            }
        })
    }

    clear() {
        this.clearCaches()
        this._map = new Map()
    }

    map<V>(fn: (value: T) => V): Grid<V> {
        const result = new Grid<V>()
        this.entries().forEach(([point, val]) => {
            result.set(point, fn(val))
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

    entries(): [Point, T][] {
        if (!this._entriesCache) {
            const result: [Point, T][] = []

            for (const [x, xMap] of this._map.entries()) {
                for (const [y, val] of xMap.entries()) {
                    result.push([new Point(x, y), val])
                }
            }

            this._entriesCache = result
        }

        return this._entriesCache
    }

    keys(): Point[] {
        if (!this._keysCache) {
            this._keysCache = this.entries().map(([point, _]) => point)
        }
        return this._keysCache
    }

    /**
     * @returns a set of all unique values in the grid
     */
    values(): T[] {
        if (!this._valuesCache) {
            const result = Array.from(new Set<T>(this.entries().map(([_, value]) => value)))
            this._valuesCache = result
        }
        return this._valuesCache
    }

    private clearCaches() {
        this._entriesCache = null
        this._keysCache = null
        this._valuesCache = null
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
        const result = {}
        this.entries().forEach(([point, value]) => {
            result[point.toString()] = value
        })
        return result
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
        Object.entries(map).forEach(([ptString, value]) => {
            g.set(Point.fromString(ptString), value)
        })
        return g
    }
}
