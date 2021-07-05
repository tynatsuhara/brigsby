import { Point } from "../Point"

/**
 * A representation of a sprite's transform in a world space, 
 * either absolute or relative to another SpriteTransform. 
 *   TODO: 
 *     - Add ways to get the relative values (right now getters result translated global values)
 */
export class SpriteTransform {

    private parentTransform: SpriteTransform
    
    dimensions: Point  // currently, there is not a concept of relative scale

    static new({
        position = new Point(0, 0),
        dimensions = null,  // if null, match the dimensions of the source image
        rotation = 0,
        mirrorX = false,
        mirrorY = false,
        depth = 0
    }: {
        position?: Point,
        dimensions?: Point,
        rotation?: number,
        mirrorX?: boolean,
        mirrorY?: boolean,
        depth?: number
    }) {
        return new SpriteTransform(
            position,
            dimensions,
            rotation,
            mirrorX,
            mirrorY,
            depth
        )
    }

    constructor(    
        position: Point = new Point(0, 0),
        dimensions: Point = null,  // if null, match the dimensions of the source image
        rotation: number = 0,
        mirrorX: boolean = false,
        mirrorY: boolean = false,
        depth: number = 0
    ) {
        this._position = position
        this.dimensions = dimensions
        this._rotation = rotation
        this._mirrorX = mirrorX
        this._mirrorY = mirrorY
        this._depth = depth
    }

    // when rotated, the x/y will not align to the global x/y grid, but rather a rotated grid
    private _position: Point
    set position(value: Point) { this._position = value }
    get position() {
        if (!this.parentTransform) return this._position

        let x = this._position.x
        let y = this._position.y
        if (!!this.parentTransform.mirrorX) {
            x = this.parentTransform.dimensions.x - x - this.dimensions.x
        }
        if (!!this.parentTransform.mirrorY) {
            y = this.parentTransform.dimensions.y - y - this.dimensions.y
        }
        return this.rotatedAround(
            this.parentTransform.position.plus(new Point(x, y)), 
            this.parentTransform.centeredPosition, 
            this.parentTransform.rotation
        )
    }

    private _rotation: number
    set rotation(value: number) { this._rotation = value }
    get rotation() {
        if (!this.parentTransform) return this._rotation
        return this.parentTransform.rotation + this._rotation * (this.mirrorX ? -1 : 1) * (this.mirrorY ? -1 : 1)
    }
    
    private _mirrorX: boolean
    set mirrorX(value: boolean) { this._mirrorX = value }
    get mirrorX() {
        if (!this.parentTransform) return this._mirrorX
        return this.parentTransform.mirrorX ? !this._mirrorX : this._mirrorX
    }
    
    private _mirrorY: boolean
    set mirrorY(value: boolean) { this._mirrorY = value }
    get mirrorY() {
        if (!this.parentTransform) return this._mirrorY
        return this.parentTransform.mirrorY ? !this._mirrorY : this._mirrorY
    }

    private _depth: number
    set depth(value: number) { this._depth = value }
    get depth() {
        if (!this.parentTransform) return this._depth
        return this.parentTransform.depth + this._depth
    }

    get centeredPosition() {
        return this.position.plus(this.dimensions.div(2))
    }
    
    rotate(angle: number, around: Point = this.position) {
        this._rotation += angle
        this._position = this.rotatedAround(this.position, around, this._rotation)
    }

    relativeTo(parentTransform: SpriteTransform) {
        this.parentTransform = parentTransform
        return this
    }

    private rotatedAround(pt: Point, center: Point, angle: number): Point {
        const x = pt.x + this.dimensions.x/2  // point to rotate around
        const y = pt.y + this.dimensions.y/2
        const cx = center.x
        const cy = center.y
        const radians = (Math.PI / 180) * -angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy
        return new Point(nx - this.dimensions.x/2, ny - this.dimensions.y/2)
    }
}
