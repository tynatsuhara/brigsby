import { Entity } from "./Entity"
import { Point } from "./Point"

export type View = {
    entities: Entity[]  // entities to be updated and rendered by the engine
    zoom: number        // scale of the view
    offset: Point       // transform applied to all entities in the view (scaled by zoom)
}
