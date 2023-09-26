import { View } from "../View"
import { RenderMethodData as AsyncRenderMethodData, RenderRequest } from "./RenderingWorker"

export class AsyncRenderer {
    private sendToWorker: (request: RenderRequest) => void

    constructor(private readonly canvas: HTMLCanvasElement, workerScriptUrl: string) {
        const [sender, receiver] = createWorker(workerScriptUrl)
        this.sendToWorker = sender

        const offscreenCanvas = canvas.transferControlToOffscreen()
        sender({ offscreenCanvas }, [offscreenCanvas])

        // receiver((response: RenderResult) => {
        // this.draw(response.imageData)
        // })
    }

    private imagesToSend: Record<number, ImageData> = {}
    private dataToSend: Array<AsyncRenderMethodData> = []

    // private draw(imageData: ImageData) {
    //     // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    //     this.context.putImageData(imageData, 0, 0)
    // }

    renderViews(views: View[]): void {
        const startTime = Date.now()
        this.imagesToSend = {}
        const viewsBuilder: RenderRequest["views"] = []

        views.forEach((view) => {
            this.dataToSend = []

            view.entities
                .flatMap((entity) => entity?.components)
                .filter((component) => !!component && component.enabled && component.isStarted)
                .flatMap((component) => component.getRenderMethods())
                .filter((render) => !!render)
                .forEach((renderMethod) => renderMethod.renderAsync(this))

            viewsBuilder.push({
                zoom: view.zoom,
                offset: view.offset,
                methods: this.dataToSend,
            })
        })

        this.sendToWorker({
            images: this.imagesToSend,
            views: viewsBuilder,
            width: this.canvas.width,
            height: this.canvas.height,
            startTime,
        })
    }

    post(data: AsyncRenderMethodData) {
        this.dataToSend.push(data)
    }

    uploadImage(source: CanvasImageSource): number {
        // For now, let's only worry about image elements which are easy to transfer.
        // We can figure out the other things later if we see a tangible perf increase.

        if (source instanceof HTMLImageElement) {
            if (!source[IMG_ID_ATTR]) {
                const tmpCanvas = document.createElement("canvas")
                const tmpContext = tmpCanvas.getContext("2d")
                tmpCanvas.width = source.width
                tmpCanvas.height = source.height
                tmpContext.drawImage(source, 0, 0)
                const id = imageCounter
                this.imagesToSend[id] = tmpContext.getImageData(0, 0, source.width, source.height)
                source[IMG_ID_ATTR] = id
                console.log("sending image " + id)

                imageCounter++
            }
            return source[IMG_ID_ATTR]
        }

        return undefined
    }
}

let imageCounter = 1

const IMG_ID_ATTR = "__BRIGSBY_IMG_ID__"

export const createWorker = <Request, Response>(
    scriptURL: string
): [
    (data: Request, transfer?: Transferable[]) => void,
    (callback: (response: Response) => void) => void
] => {
    const worker = new Worker(scriptURL)
    const sender = (data: Request, transfer?: Transferable[]) => {
        worker.postMessage(data, transfer)
    }
    const receiver = (callback: (response: Response) => void) => {
        worker.onmessage = (responseMessage) => callback(responseMessage.data)
    }
    return [sender, receiver]
}
