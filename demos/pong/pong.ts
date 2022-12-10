import { Engine } from "../../src/Engine"
import { Entity } from "../../src/Entity"
import { Game } from "../../src/Game"
import { InputKey } from "../../src/Input"
import { Point } from "../../src/Point"
import { renderer } from "../../src/renderer/Renderer"
import { View } from "../../src/View"
import { Ball } from "./Ball"
import { Paddle } from "./Paddle"
import { TextDisplay } from "./TextDisplay"

class PongGame extends Game {
    private view: View

    initialize() {
        const dimensions = renderer.getDimensions()
        const textDisplay = new TextDisplay()
        const centerY = (dimensions.y - Paddle.DIMENSIONS.y) / 2
        const player1 = new Paddle(
            new Point(Paddle.PADDING_FROM_EDGE, centerY),
            InputKey.W,
            InputKey.S
        )
        const player2 = new Paddle(
            new Point(dimensions.x - Paddle.PADDING_FROM_EDGE - Paddle.DIMENSIONS.x, centerY),
            InputKey.UP,
            InputKey.DOWN
        )
        const ball = new Ball(dimensions.div(2), player1, player2, textDisplay)

        this.view = {
            entities: [
                new Entity([textDisplay]),
                new Entity([player1]),
                new Entity([player2]),
                new Entity([ball]),
            ],
            zoom: 1,
            offset: Point.ZERO,
        }

        this.scene = {
            getViews: () => [this.view],
        }
    }
}

Engine.start(new PongGame(), <HTMLCanvasElement>document.getElementById("pong-canvas"))
