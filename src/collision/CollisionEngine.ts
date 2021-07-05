import { Point } from "../Point"
import { Maths } from "../util/Maths"
import { View } from "../View"
import { BoxCollider } from "./BoxCollider"
import { Collider } from "./Collider"

/**
 * This class manages collisions between collider components
 */
export class CollisionEngine {

    static readonly DEFAULT_LAYER = "default"

    private colliders: Collider[] = []

    private matrix: Map<string, Set<string>>

    constructor() {
        this.setCollisionMatrix(new Map())
    }

    /**
     * @param matrix Each layer key in the matrix will trigger collisions with all of the layer values in the corresponding list (and vice-versa)
     *               DEFAULT_LAYER will always collide with DEFAULT_LAYER
     */
    setCollisionMatrix(matrix: Map<string, string[]>) {
        const bidirectional = new Map<string, Set<string>>()
        bidirectional.set(CollisionEngine.DEFAULT_LAYER, new Set([CollisionEngine.DEFAULT_LAYER]))

        for (const r of Array.from(matrix.keys())) {
            for (const c of matrix.get(r)) {
                if (!bidirectional.has(r)) bidirectional.set(r, new Set())
                bidirectional.get(r).add(c)
                if (!bidirectional.has(c)) bidirectional.set(c, new Set())
                bidirectional.get(c).add(r)
            }
        }

        this.matrix = bidirectional
    }

    /**
     * @param view The view whose contained colliders will be used for collision detection in the current update() step
     */
    _setViewContext(view: View) {
        this.colliders = view.entities
                .filter(e => !!e)
                .flatMap(e => e.getComponents(Collider))
    }

    // Needs further testing. No active use case right now.
    _tryMove(collider: Collider, to: Point): Point {
        const translation = to.minus(collider.position)
        const pts = collider.getPoints()

        // find all colliders within a bounding box
        const xMin = Math.min(...pts.map(pt => pt.x + Math.min(translation.x, 0)))
        const xMax = Math.max(...pts.map(pt => pt.x + Math.max(translation.x, 0)))
        const yMin = Math.min(...pts.map(pt => pt.y + Math.min(translation.y, 0)))
        const yMax = Math.max(...pts.map(pt => pt.y + Math.max(translation.y, 0)))
        const potentialCollisions = this.colliders.filter(other => other !== collider && other.getPoints().some(pt => {
            return Maths.rectContains(new Point(xMax, yMin), new Point(xMax-xMin, yMax-yMin), pt)
        })) 
        
        // for all pts and all those colliders, find the closest intersection
        const collisions = pts.flatMap(pt => potentialCollisions
                .map(other => other.lineCast(pt, pt.plus(translation)))
                .filter(intersect => !!intersect)
                .map(intersect => intersect.minus(collider.position))  // the distance `pt` can move before it collides with `other`
        )

        if (collisions.length > 0) { 
            const dist = collisions.reduce((l, r) => l.magnitude() < r.magnitude() ? l : r)
            return collider.position.plus(dist)
        } else {
            return to
        }
    }

    // Returns true if the collider can be translated and will not intersect another collider in the new position.
    // This DOES NOT check for any possible colliders in the path of the collision and should only be used for small translations.
    _canTranslate(collider: Collider, translation: Point): boolean {
        const collidingLayers = this.matrix.get(collider.layer)
        if (!collidingLayers || collidingLayers.size === 0) {  // nothing will ever block this collider
            return true
        }
        // const translatedPoints = collider.getPoints().map(pt => pt.plus(translation))
        const bc = collider as BoxCollider
        const newTranslatedPos = bc.position.plus(translation)
        return !this.colliders
                .filter(other => 
                    other !== collider && other.enabled && collidingLayers.has(other.layer) 
                            && collider.ignoredColliders.indexOf(other) === -1 && other.ignoredColliders.indexOf(collider) === -1)  // potential collisions
                .some(other => {
                    // TODO: Support non-box-colliders
                    const obc = other as BoxCollider
                    const willCollide = !(
                        newTranslatedPos.x > obc.position.x + obc.dimensions.x ||
                        newTranslatedPos.y > obc.position.y + obc.dimensions.y ||
                        newTranslatedPos.x + bc.dimensions.x < obc.position.x ||
                        newTranslatedPos.y + bc.dimensions.y < obc.position.y
                    )
                    // && !isAlreadyColliding
                    return willCollide && (
                        bc.position.x > obc.position.x + obc.dimensions.x ||
                        bc.position.y > obc.position.y + obc.dimensions.y ||
                        bc.position.x + bc.dimensions.x < obc.position.x ||
                        bc.position.y + bc.dimensions.y < obc.position.y
                    )
                }) 
    }
}

export const collisionEngine = new CollisionEngine()
