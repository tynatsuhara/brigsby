import { PointValue, pt } from "../Point"
import { EllipseRender } from "./EllipseRender"
import { ImageRender } from "./ImageRender"
import { LineRender } from "./LineRender"
import { RectRender } from "./RectRender"
import { RenderContext } from "./RenderContext"
import { RenderMethod } from "./RenderMethod"
import { TextRender } from "./TextRender"

type RenderType =
    | "i" // image
    | "r" // rect
    | "e" // ellipse
    | "l" // line
    | "t" // text

export type RenderMethodData = {
    t: RenderType
    d: number // depth
} & Record<string, any>

export type RenderRequest = {
    images: Record<number, ImageData>
    views: Array<{
        zoom: number
        offset: PointValue
        methods: Array<RenderMethodData>
    }>
    width: number
    height: number
}

export type RenderResult = {
    imageData: ImageData
}

const globalImageCache: Record<number, OffscreenCanvas> = {}

const canvas = new OffscreenCanvas(0, 0)
const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

export const handleRenderingEvent = (message: MessageEvent<RenderRequest>) => {
    const { images, views, width, height } = message.data

    Object.keys(images).forEach((id) => {
        const img = images[id] as ImageData
        const imgCanvas = new OffscreenCanvas(img.width, img.width)
        const imgContext = imgCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D
        imgContext.putImageData(img, 0, 0)
        globalImageCache[id] = imgCanvas
    })

    canvas.width = width
    canvas.height = height
    context.imageSmoothingEnabled = false

    views.forEach((view) => {
        const viewRenderContext = new RenderContext(
            canvas,
            context,
            view.zoom,
            pt(view.offset.x, view.offset.y)
        )

        view.methods
            .map(dataToRenderMethod)
            .filter((rm) => !!rm)
            .sort((a, b) => a.depth - b.depth)
            .forEach((renderMethod) => renderMethod.render(viewRenderContext))
    })

    const response: RenderResult = {
        imageData: context.getImageData(0, 0, width, height),
    }

    postMessage(response)

    ///////////////////////////////
    /*
    
    const { imageData, width, height, scale } = message.data

    const smallCanvas = new OffscreenCanvas(width / scale, height / scale)
    const smallContext = smallCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    const getPixel = (x: number, y: number) => {
        const index = (y * width + x) * 4
        return [
            imageData.data[index + 0],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3],
        ]
    }

    // pixels shaved off for each row offset from the top/bottom
    const cornerShape = [4, 2, 1, 1]

    for (let y = 0; y < smallCanvas.height; y++) {
        for (let x = 0; x < smallCanvas.width; x++) {
            // round the corners
            if (y < cornerShape.length) {
                const rowBlankCount = cornerShape[y]
                if (x < rowBlankCount || x >= smallCanvas.width - rowBlankCount) {
                    continue
                }
            } else if (y >= smallCanvas.height - cornerShape.length) {
                const rowBlankCount = cornerShape[smallCanvas.height - y - 1]
                if (x < rowBlankCount || x >= smallCanvas.width - rowBlankCount) {
                    continue
                }
            }

            const bigX = x * scale
            const bigY = y * scale

            const hexStrings = []
            for (let i = 0; i < scale; i++) {
                for (let j = 0; j < scale; j++) {
                    const [r, g, b] = getPixel(i + bigX, j + bigY)
                    const hex = getHex(r, g, b)

                    // weigh other colors higher than grass color to show non-nature things on the map
                    let hexWeight = 3
                    if (hex === Color.GREEN_5) {
                        hexWeight = 1
                    } else if (hex === Color.GREEN_6) {
                        hexWeight = 2
                    }
                    hexStrings.push(...Array.from({ length: hexWeight }, () => hex))
                }
            }

            const newColor = Lists.mode(hexStrings)
            smallContext.fillStyle = newColor
            smallContext.fillRect(x, y, 1, 1)
        }
    }
    */
}

const dataToRenderMethod = (data: RenderMethodData): RenderMethod | undefined => {
    switch (data.t) {
        case "e":
            return new EllipseRender({
                depth: data.d,
                position: pt(data.px, data.py),
                dimensions: pt(data.dx, data.dy),
                color: data.c,
            })
        case "l":
            return new LineRender(pt(data.sx, data.sy), pt(data.ex, data.ey), data.c, data.w)
        case "r":
            return new RectRender({
                depth: data.d,
                position: pt(data.px, data.py),
                dimensions: pt(data.dx, data.dy),
                color: data.c,
            })
        case "t":
            return new TextRender(
                data.tx,
                pt(data.px, data.py),
                data.s,
                data.f,
                data.c,
                data.d,
                data.a
            )
        case "i":
            const img = globalImageCache[data.i]
            if (!img) {
                return undefined
            }
            return new ImageRender(
                img,
                pt(data.spx, data.spy),
                pt(data.sdx, data.sdy),
                pt(data.px, data.py),
                pt(data.dx, data.dy),
                data.d,
                data.r,
                data.mx,
                data.my,
                data.a
            )
    }
}
