import { Point } from "../Point"
import { BinaryHeap } from "./BinaryHeap"

// an infinite grid using x/y coordinates (x increases to the right, y increases down)
export class Grid<T> {
    private map: { [key: string]: T } = {}
    private _valuesCache: T[]  // calling Object.values() repeatedly is expensive
    
    set(pt: Point, entry: T) {
        this._valuesCache = null
        this.map[pt.toString()] = entry
    }
    
    /**
     * @returns the element at the point or null if not present in the grid
     */
    get(pt: Point): T {
        return this.map[pt.toString()]
    }

    remove(pt: Point) {
        this._valuesCache = null
        delete this.map[pt.toString()]
    }

    removeAll(element: T) {
        this._valuesCache = null
        Object.entries(this.map)
                .filter(kv => kv[1] === element)
                .forEach(kv => delete this.map[kv[0]])
    }

    clear() {
        this.map = {}
        this._valuesCache = null
    }

    /**
     * This requires parsing all keys and can be expensive if done frequently
     */
    entries(): [Point, T][] {
        return Object.entries(this.map).map(tuple => [Point.fromString(tuple[0]), tuple[1]])
    }

    /**
     * This requires parsing all keys and can be expensive if done frequently
     */
    keys(): Point[] {
        return Object.keys(this.map).map(ptStr => Point.fromString(ptStr))
    }
    
    /**
     * @returns a set of all unique values in the grid
     */
    values(): T[] {
        if (!this._valuesCache) {
            this._valuesCache = Array.from(new Set(Object.values(this.map)))
        }
        return this._valuesCache
    }

    /**
     * Returns a path inclusive of start and end
     */
    findPath(
        start: Point, 
        end: Point, 
        {
            heuristic = pt => pt.manhattanDistanceTo(end),
            distance = (a, b) => a.manhattanDistanceTo(b),
            isOccupied = pt => !!this.get(pt),
            getNeighbors = pt => [new Point(pt.x, pt.y - 1), new Point(pt.x - 1, pt.y), new Point(pt.x + 1, pt.y), new Point(pt.x, pt.y + 1)],
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

        return this.findPathInternal(start, end, heuristic, distance, isOccupied, getNeighbors, shortCircuit)
    }

    private findPathInternal(
        start: Point, 
        end: Point, 
        heuristic: (pt: Point) => number,
        distance: (a: Point, b: Point) => number,
        isOccupied: (pt: Point) => boolean,
        getNeighbors: (pt: Point) => Point[],
        shortCircuit: number,
    ): Point[] {
        const gScore = new Map<string, number>()
        gScore.set(start.toString(), 0)

        const fScore = new Map<string, number>()
        fScore.set(start.toString(), 0)

        const cameFrom = new Map<string, Point>()
        const openSetUnique = new Set<string>()
        const openSet = new BinaryHeap<Point>(p => fScore.get(p.toString()))
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
            
            const neighbors = getNeighbors(current).filter(pt => !isOccupied(pt) && !pt.equals(start))
            
            for (let neighbor of neighbors) {
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

    save(): { [key: string]: T } {
        return this.map
    }

    static load<T>(map: { [key: string]: T }): Grid<T> {
        const g = new Grid<T>()
        g.map = map
        return g
    }
}