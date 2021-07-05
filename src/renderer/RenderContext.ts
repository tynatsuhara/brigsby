import { View } from "../View"
import { Point } from "../Point"

export class RenderContext {
    private readonly canvas: HTMLCanvasElement
    private readonly context: CanvasRenderingContext2D
    private readonly view: View
    
    readonly width: number
    readonly height: number

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View) {
        this.canvas = canvas
        this.context = context
        this.view = view

        this.width = canvas.width
        this.height = canvas.height
    }

    set lineWidth(value: number) { this.context.lineWidth = value }
    set strokeStyle(value: string) { this.context.strokeStyle = value }

    set font(value: string) { this.context.font = value }
    set fillStyle(value: string) { this.context.fillStyle = value }

    measureText(text: any) {
        return this.context.measureText(text)
    }

    fillText(size: number, font: string, color: string, text: string, point: Point) {
        const offset = this.view.offset.times(this.view.zoom).apply(Math.floor)
        this.context.font = `${size * this.view.zoom}px '${font}'`
        this.context.fillStyle = color
        point = point.times(this.view.zoom).apply(Math.floor).plus(offset)
        this.context.fillText(text, point.x, point.y + size*this.view.zoom)
    }

    fillRect(pos: Point, dimensions: Point): void {
        pos = pos.plus(this.view.offset).times(this.view.zoom)
        dimensions = dimensions.times(this.view.zoom)

        this.context.fillRect(pos.x, pos.y, dimensions.x, dimensions.y)
    }

    /**
     * @param source 
     * @param sourcePosition 
     * @param sourceDimensions 
     * @param destPosition the top left corner where the image will be drawn
     * @param destDimensions 
     * @param rotation (will be mirrored by mirrorX or mirrorY)
     * @param pixelPerfect 
     * @param mirrorX 
     * @param mirrorY 
     */
    drawImage(
        source: CanvasImageSource, 
        sourcePosition: Point, 
        sourceDimensions: Point, 
        destPosition: Point,
        destDimensions: Point, 
        rotation: number,
        pixelPerfect: boolean,
        mirrorX: boolean,
        mirrorY: boolean
    ): void {
        destDimensions = destDimensions ?? sourceDimensions
        // const mirroredOffset = new Point(mirrorX ? destDimensions.x : 0, mirrorY ? destDimensions.y : 0)
        const offset = this.view.offset.times(this.view.zoom).apply(Math.floor)
        let scaledDestPosition = destPosition./*plus(mirroredOffset).*/times(this.view.zoom).plus(offset)
        if (pixelPerfect) {
            scaledDestPosition = this.pixelize(scaledDestPosition)
        }
        const scaledDestDimensions = destDimensions.times(this.view.zoom)

        const biggestDimension = Math.max(scaledDestDimensions.x, scaledDestDimensions.y) // to make sure things get rendered if rotated at the edge of the screen
        if (scaledDestPosition.x > this.canvas.width + biggestDimension
            || scaledDestPosition.x + scaledDestDimensions.x < -biggestDimension
            || scaledDestPosition.y > this.canvas.height + biggestDimension
            || scaledDestPosition.y + scaledDestDimensions.y < -biggestDimension) {
            return
        }

        this.context.save()

        // Use Math.floor() to prevent tearing between images
        this.context.translate(
            Math.floor(scaledDestPosition.x),
            Math.floor(scaledDestPosition.y)
        )

        const rotationTranslate = destDimensions.div(2).times(this.view.zoom)
        this.context.translate(rotationTranslate.x, rotationTranslate.y)
        this.context.rotate(rotation * Math.PI/180)
        this.context.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1)

        this.context.drawImage(
            source, 
            sourcePosition.x, sourcePosition.y, 
            sourceDimensions.x, sourceDimensions.y, 
            -rotationTranslate.x, -rotationTranslate.y,
            scaledDestDimensions.x, scaledDestDimensions.y
        )

        this.context.restore()
    }

    rotate(angle: number): void {
        this.context.rotate(angle)
    }

    scale(x: number, y: number): void {
        this.context.scale(x, y)
    }

    beginPath(): void {
        this.context.beginPath()
    }

    moveTo(point: Point): void {
        point = point.plus(this.view.offset).times(this.view.zoom)
        this.context.moveTo(point.x, point.y)
    }

    lineTo(point: Point): void {
        point = point.plus(this.view.offset).times(this.view.zoom)
        this.context.lineTo(point.x, point.y)
    }

    stroke(): void {
        this.context.stroke()
    }

    pixelize(point: Point): Point {
        return new Point(point.x - (point.x % this.view.zoom), point.y - (point.y % this.view.zoom))
    }
}