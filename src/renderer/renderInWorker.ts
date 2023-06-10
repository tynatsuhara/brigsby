import { handleRenderingEvent } from "./RenderingWorker"

export const renderInWorker = () => {
    addEventListener("message", (event) => {
        handleRenderingEvent(event)
    })
}
