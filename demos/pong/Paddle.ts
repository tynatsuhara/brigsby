import { Component } from "../../src/Component"
import { UpdateData } from "../../src/Engine"
import { InputKey } from "../../src/Input"
import { Point } from "../../src/Point"
import { RectRender } from "../../src/renderer/RectRender"
import { Maths } from "../../src/util/Maths"

export class Paddle extends Component {

    static readonly PADDING_FROM_EDGE = 20
    static readonly DIMENSIONS = new Point(16, 80)
    static readonly MOVE_SPEED = .6

    private pos: Point
    private readonly upKey: InputKey
    private readonly downKey: InputKey
    velocity: number  // -1, 0, 1

    constructor(pos: Point, upKey: InputKey, downKey: InputKey) {
        super()
        this.pos = pos
        this.upKey = upKey
        this.downKey = downKey
    }

    update(data: UpdateData) {
        this.velocity = 0
        if (data.input.isKeyHeld(this.upKey)) {
            this.velocity = -1
        }
        if (data.input.isKeyHeld(this.downKey)) {
            this.velocity = 1
        }

        const newY = Maths.clamp(
            this.pos.y + (this.velocity * (Paddle.MOVE_SPEED * data.elapsedTimeMillis)), 
            0, 
            data.dimensions.y - Paddle.DIMENSIONS.y
        )

        this.pos = new Point(this.pos.x, newY)
    }

    isColliding(pos: Point) {
        return Maths.rectContains(this.pos, Paddle.DIMENSIONS, pos)
    }

    getRenderMethods() {
        return [
            new RectRender({
                position: this.pos,
                dimensions: Paddle.DIMENSIONS,
                color: "#fff6d3",
            })
        ]
    }
}