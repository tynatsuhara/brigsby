import { Component } from "../../src/Component"
import { UpdateData } from "../../src/Engine"
import { Point } from "../../src/Point"
import { TextRender } from "../../src/renderer/TextRender"

const FONT = "Lexend Deca"
const COLOR = "#fff6d3"

export class TextDisplay extends Component {

    playerOneScore = 0
    playerTwoScore = 0

    update(data: UpdateData) {
        this.getRenderMethods = () => {
            return [
                new TextRender(
                    `${this.playerOneScore} : ${this.playerTwoScore}`,
                    new Point(data.dimensions.x/2, 15),
                    30,
                    FONT,
                    COLOR,
                    0,
                    "center"
                ),
                new TextRender(
                    "P1: W/S, P2: UP/DOWN, SPACE TO LAUNCH",
                    new Point(data.dimensions.x/2, data.dimensions.y - 40),
                    20,
                    FONT,
                    COLOR,
                    0,
                    "center"
                ),
            ]
        }
    }
}