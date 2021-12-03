import { Component } from "../../src/Component"
import { UpdateData } from "../../src/Engine"
import { InputKey } from "../../src/Input"
import { Point } from "../../src/Point"
import { EllipseRender } from "../../src/renderer/EllipseRender"
import { Paddle } from "./Paddle"
import { TextDisplay } from "./TextDisplay"

export class Ball extends Component {
    static readonly RADIUS = 8
    static readonly SIZE = new Point(1, 1).times(Ball.RADIUS * 2)
    static readonly SPEED = 0.3

    private readonly spawnPos: Point
    private readonly player1: Paddle
    private readonly player2: Paddle
    private readonly textDisplay: TextDisplay
    private position: Point // the center position of the ball
    private velocity: Point
    private waitingForInput = true

    constructor(spawnPos: Point, player1: Paddle, player2: Paddle, textDisplay: TextDisplay) {
        super()

        this.spawnPos = spawnPos
        this.player1 = player1
        this.player2 = player2
        this.textDisplay = textDisplay

        this.spawn(Math.random() > 0.5 ? 1 : -1)
    }

    update(data: UpdateData) {
        if (this.waitingForInput) {
            if (data.input.isKeyDown(InputKey.SPACE)) {
                this.waitingForInput = false
            } else {
                return
            }
        }

        this.position = this.position.plus(this.velocity.times(data.elapsedTimeMillis * Ball.SPEED))

        if (
            (this.position.y < Ball.RADIUS && this.velocity.y < 0) ||
            (this.position.y > data.dimensions.y - Ball.RADIUS && this.velocity.y > 0)
        ) {
            this.velocity = new Point(this.velocity.x, -this.velocity.y)
        }

        const paddleMovementMultiplier = 1.1

        if (this.velocity.x < 0 && this.player1.isColliding(this.position)) {
            const yVelocity = this.velocity.y + this.player1.velocity * paddleMovementMultiplier
            this.velocity = new Point(-this.velocity.x, yVelocity)
        } else if (this.velocity.x > 0 && this.player2.isColliding(this.position)) {
            const yVelocity = this.velocity.y + this.player2.velocity * paddleMovementMultiplier
            this.velocity = new Point(-this.velocity.x, yVelocity)
        }

        if (this.velocity.magnitude() < 1) {
            this.velocity = this.velocity.normalized()
        }

        if (this.position.x > data.dimensions.x) {
            this.textDisplay.playerOneScore++
            this.spawn(-1)
        } else if (this.position.x < 0) {
            this.textDisplay.playerTwoScore++
            this.spawn(1)
        }
    }

    getRenderMethods() {
        return [
            new EllipseRender({
                position: this.position.minus(Ball.SIZE.div(2)),
                dimensions: Ball.SIZE,
                color: "#fff6d3",
            }),
        ]
    }

    private spawn(direction: number) {
        this.position = this.spawnPos
        this.velocity = new Point(direction, (Math.random() - 1) * 3).normalized()
        this.waitingForInput = true
    }
}
