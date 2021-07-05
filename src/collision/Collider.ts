import { Component } from "../Component"
import { debug } from "../Debug"
import { Point } from "../Point"
import { LineRender } from "../renderer/LineRender"
import { RenderMethod } from "../renderer/RenderMethod"
import { CollisionEngine, collisionEngine } from "./CollisionEngine"

/**
 * A collider detects intersections with other colliders. Other 
 * colliders will not be able to move in to this collider's space.
 */
export abstract class Collider extends Component {

    private _position: Point  // top-left
    get position() { return this._position }

    readonly layer: string    
    readonly ignoredColliders: Collider[]

    /**
     * @param position top left position
     * @param layer determines which colliders collide based on the collision matrix
     */
    constructor(position: Point, layer = CollisionEngine.DEFAULT_LAYER, ignoredColliders: Collider[] = []) {
        super()
        this._position = position
        this.layer = layer
        this.ignoredColliders = ignoredColliders
    }

    moveTo(point: Point): Point {
        if (!this.enabled) {
            this._position = point
            return this.position
        }
        const dx = point.x - this.position.x
        const dy = point.y - this.position.y
        // TODO: Should these branches be handled by the caller?
        if (collisionEngine._canTranslate(this, new Point(dx, dy))) {
            this._position = point
        } else if (collisionEngine._canTranslate(this, new Point(dx, 0))) {
            this._position = this._position.plus(new Point(dx, 0))
        } else if (collisionEngine._canTranslate(this, new Point(0, dy))) {
            this._position = this._position.plus(new Point(0, dy))
        }
        return this.position
    }

    forceSetPosition(point: Point): Point {
        this._position = point
        return this.position
    }

    getRenderMethods(): RenderMethod[] {
        if (!debug.showColliders) {
            return []
        }
        
        const color = "#ff0000"
        const pts = this.getPoints()
        const lines = []
        let lastPt = pts[pts.length-1]
        for (const pt of pts) {
            lines.push(new LineRender(pt, lastPt, color))
            lastPt = pt
        }

        return lines
    }

    /**
     * Returns the first point where a line from start->end intersects with this collider.
     * Returns null if there is no intersection.
     */
    lineCast(start: Point, end: Point): Point {
        let result = null
        let resultDist = 0

        const pts = this.getPoints()
        let lastPt = pts[pts.length-1]

        for (const pt of pts) {
            const intersect = this.lineIntersect(pt, lastPt, start, end)
            if (!!intersect) {
                const dist = intersect.distanceTo(start)
                if (result == null || dist < resultDist) {
                    result = intersect
                    resultDist = dist
                }
            }
            lastPt = pt
        }

        return result
    }

    checkWithinBoundsAfterTranslation(translation: Point, other: Collider) {
        this._position = this._position.plus(translation)
        const result = other.getPoints().some(p => this.isWithinBounds(p))
        this._position = this._position.minus(translation)
        return result
    }

    private lineIntersect(line1Start, line1End, line2Start, line2End): Point {
        // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
        const x1 = line1Start.x
        const y1 = line1Start.y
        const x2 = line1End.x
        const y2 = line1End.y
        const x3 = line2Start.x
        const y3 = line2Start.y
        const x4 = line2End.x
        const y4 = line2End.y

        // lines with the same slope don't intersect
        if (((x1-x2) * (y3-y4) - (y1-y2) * (x3-x4)) == 0) {
            return null
        }

        const tNumerator = (x1-x3) * (y3-y4) - (y1-y3) * (x3-x4)
        const uNumerator = -((x1-x2) * (y1-y3) - (y1-y2) * (x1-x3))
        const denominator = (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4)

        if (tNumerator >= 0 && tNumerator <= denominator && uNumerator >= 0 && uNumerator <= denominator) {
            const t = tNumerator/denominator
            return new Point(x1 + t * (x2-x1), y1 + t * (y2-y1))
        }

        return null
    }
    
    /**
     * Returns the points which form the shape of the collider.
     * If any of these points are contained within another collider,
     * they are considered to be colliding.
     */
    abstract getPoints(): Point[]
    
    /**
     * Returns true if pt is located within the collider.
     */
    abstract isWithinBounds(pt: Point): boolean
}
