import { PointValue, pt } from "../Point"
import { measure } from "../Profiler"
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
    startTime: number
}

export type RenderResult = {
    imageData: ImageData
}

const globalImageCache: Record<number, OffscreenCanvas> = {}

let canvas: OffscreenCanvas = undefined
let context: OffscreenCanvasRenderingContext2D = undefined

const handleRenderingEvent = (message: MessageEvent<RenderRequest>) => {
    // @ts-ignore
    if (message.data.offscreenCanvas) {
        console.log("registered canvas in worker")
        // @ts-ignore
        canvas = message.data.offscreenCanvas
        // @ts-ignore
        context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D
        return
    }

    const { images, views, width, height, startTime } = message.data
    const startTimeOnWorker = Date.now()

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

    const [renderDuration] = measure(() => {
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
    })

    // it seems like the bulk of the work is still actually happening on the main thread :(
    const renderFinishTime = Date.now()
    // console.log(
    //     `main thread = ${startTimeOnWorker - startTime}ms, worker = ${
    //         renderFinishTime - startTimeOnWorker
    //     }ms`
    // )
}

onmessage = handleRenderingEvent

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
