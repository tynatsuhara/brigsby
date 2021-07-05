import { Point } from "../Point"

export const Maths = {
    rectContains(rectPosition: Point, rectDimensions: Point, pt: Point): boolean {
        return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
                    && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y
    },
    
    clamp(val: number, min: number, max: number) {
        return Math.min(Math.max(val, min), max)
    },
}
