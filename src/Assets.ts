/**
 * A class used for pre-loading and caching assets.
 */
class Assets {
    
    private readonly imageMap = new Map<string, HTMLImageElement>()
    private readonly audioMap = new Map<string, string>()

    /**
     * returns a promise to load a font already added to the default set of the page 
     * (eg via a stylesheet or <link> tag)
     * @param font a font specification using CSS value syntax, eg "italic bold 16px Roboto"
     */
    loadFont(font: string, src: string): Promise<void> {
        return new window["FontFace"](font, src).load().then(ff => document["fonts"].add(ff))
    }

    loadImageFiles(relativePaths: string[]): Promise<void[]> {
        const promises = relativePaths.map(path => new Promise<void>(resolve => {
            const loadingImage = new Image()
            loadingImage.onload = () => {
                this.imageMap.set(path, loadingImage)
                resolve()
            }
            loadingImage.src = path
        }))

        return Promise.all(promises)
    }

    /**
     * returns an image element which has been previously loaded
     */
    getImageByFileName = (fileName: string) => this.imageMap.get(fileName)

    loadAudioFiles(relativePaths: string[]): Promise<void[]> {
        const promises = relativePaths.map(path => new Promise<void>(resolve => {
            fetch(path).then(response => response.blob()).then(blob => {
                const audioBlob = URL.createObjectURL(blob)
                this.audioMap.set(path, audioBlob)
                resolve()
            })
        }))

        return Promise.all(promises)
    }

    /**
     * returns an audio element which has been previously loaded
     */
    getAudioByFileName = (fileName: string) => {
        const objectURL = this.audioMap.get(fileName)
        return new Audio(objectURL)
    }
}

export const assets = new Assets()