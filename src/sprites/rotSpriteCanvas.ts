/*
Original implementation: https://github.com/adnanlah/rotsprite-webgl

MIT License

Copyright (c) 2022 Abdelrahman Adnan Lahrech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { debug } from "../Debug"
import { Point } from "../Point"

export const rotSpriteCanvas = (
    imageSource: CanvasImageSource,
    sourcePosition: Point,
    sourceDimensions: Point,
    degree: number
) => {
    const SCALE = 8
    const { x: naturalWidth, y: naturalHeight } = sourceDimensions
    if (naturalWidth > 512 || naturalHeight > 512) {
        throw new Error("Size exceeded")
    }

    const sourceCanvas = document.createElement("canvas")
    const sourceContext = sourceCanvas.getContext("2d")
    const drawToSourceCanvas = (xOffset: number, yOffset: number) => {
        sourceContext.drawImage(
            imageSource,
            sourcePosition.x,
            sourcePosition.y,
            sourceDimensions.x,
            sourceDimensions.y,
            xOffset,
            yOffset,
            sourceDimensions.x,
            sourceDimensions.y
        )
    }

    sourceCanvas.width = naturalWidth
    sourceCanvas.height = naturalHeight

    // for 90/180/270 we can rotate in a cheaper way
    if (degree % 90 === 0) {
        if (debug.spriteRotateDebug) {
            console.log("quick rotation")
        }
        if (degree % 180 !== 0) {
            sourceCanvas.width = naturalHeight
            sourceCanvas.height = naturalWidth
        }
        const radians = (degree * Math.PI) / 180
        sourceContext.rotate(radians)
        // offsets:
        //   90: 0, -y
        //   180: -x, -y
        //   270: -x, 0
        drawToSourceCanvas(
            degree > 90 ? -sourceDimensions.x : 0,
            degree < 270 ? -sourceDimensions.y : 0
        )
        return sourceCanvas
    } else {
        // draw to the source canvas so we can call getImageData
        drawToSourceCanvas(0, 0)
    }

    const image = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
    const reduced = reduceImage(image.data)

    const upscaledImage = upscaleImageEPX(reduced, image.width, image.height, SCALE)

    let { rotated, rotW, rotH } = rotate(
        upscaledImage,
        naturalWidth * SCALE,
        naturalHeight * SCALE,
        degree
    )

    let {
        downscaled,
        width: finalWidth,
        height: finalHeight,
    } = downscaleNNTopLeft(rotated, rotW, rotH, SCALE, 2)

    let finalResult = flattenImage(downscaled)

    const imageDataFinal = new ImageData(
        new Uint8ClampedArray(finalResult),
        finalWidth,
        finalHeight
    )

    const canvas = document.createElement("canvas")
    canvas.width = finalWidth
    canvas.height = finalHeight
    canvas.getContext("2d").putImageData(imageDataFinal, 0, 0)

    return canvas
}

const reduceImage = (imageData: Uint8ClampedArray) => {
    return imageData.reduce((acc, curr, idx, array) => {
        if (idx % 4 === 0) {
            return acc.concat(stringifyRGBA(array.slice(idx, idx + 4)))
        } else return acc
    }, [] as string[])
}

const upscaleImageEPX = (
    imageData: string[],
    srcW: number,
    srcH: number,
    scale: number
): string[] => {
    if (scale === 1) return imageData

    let dstA = new Array(imageData.length * 4)
    let dstIt1 = 0
    let dstIt2 = 0

    for (let y = 0; y < srcH; y++) {
        dstIt2 += srcW * 2
        for (let x = 0; x < srcW; x++) {
            const p = imageData[getIdx(srcW, y, x)],
                a = y > 0 ? imageData[getIdx(srcW, y - 1, x)] : p,
                b = x < srcW - 1 ? imageData[getIdx(srcW, y, x + 1)] : p,
                c = x > 0 ? imageData[getIdx(srcW, y, x - 1)] : p,
                d = y < srcH - 1 ? imageData[getIdx(srcW, y + 1, x)] : p

            dstA[dstIt1] = areEqual(c, a) && !areEqual(c, d) && !areEqual(a, b) ? a : p
            dstIt1++
            dstA[dstIt1] = areEqual(a, b) && !areEqual(a, c) && !areEqual(b, d) ? b : p
            dstIt1++

            dstA[dstIt2] = areEqual(d, c) && !areEqual(d, b) && !areEqual(c, a) ? c : p
            dstIt2++
            dstA[dstIt2] = areEqual(b, d) && !areEqual(b, a) && !areEqual(d, c) ? d : p
            dstIt2++
        }
        dstIt1 += srcW * 2
    }

    return upscaleImageEPX(dstA, srcW * 2, srcH * 2, scale / 2)
}

const rotate = (imageData: string[], srcW: number, srcH: number, deg: number) => {
    const [rotW, rotH] = imageSizeAfterRotation([srcW, srcH], deg)

    const cos = Math.cos((deg * Math.PI) / 180),
        sin = Math.sin((deg * Math.PI) / 180)

    let rotated: string[] = new Array(Math.round(rotW) * Math.round(rotH))
    let painted = []

    for (let t = 0; t < rotH; t++) {
        let row = []
        for (let s = 0; s < rotW; s++) {
            const x = Math.round((s - rotW / 2) * cos + (t - rotH / 2) * sin + srcW / 2)
            const y = Math.round(-(s - rotW / 2) * sin + (t - rotH / 2) * cos + srcH / 2)
            if (x >= 0 && y >= 0 && x < srcW && y < srcH) {
                rotated[getIdx(rotW, t, s)] = imageData[getIdx(srcW, y, x)]
                const paintedPix = { x: s, color: imageData[getIdx(srcW, y, x)] }
                row.push(paintedPix)
            } else {
                rotated[getIdx(rotW, t, s)] = stringifyRGBA([0, 255, 255, 0])
            }
        }
        if (row.length) painted.push(row)
    }

    return { rotated, painted, rotW, rotH }
}

const downscaleNNTopLeft = (
    imageData: string[],
    width: number,
    height: number,
    sourceScale: number,
    step = 2
): { downscaled: string[]; width: number; height: number } => {
    if (sourceScale === 1) return { downscaled: imageData, width, height }
    const smallH = Math.ceil(height / step)
    const smallW = Math.ceil(width / step)
    let downscaled: string[] = new Array(smallH * smallW)

    for (let i = 0; i < smallH; i++) {
        for (let j = 0; j < smallW; j++) {
            downscaled[getIdx(smallW, i, j)] = imageData[getIdx(width, i * step, j * step)]
        }
    }

    return downscaleNNTopLeft(downscaled, smallW, smallH, sourceScale / step, step)
}

const stringifyRGBA = (a: Uint8ClampedArray | number[]) => `${a[0]}.${a[1]}.${a[2]}.${a[3]}`

const getIdx = (w: number, y: number, x: number) => w * y + x

const areEqual = (c1: string, c2: string) => c1 === c2

const flattenImage = (arr: string[]) => arr.map((e) => e.split(".").map((e) => Number(e))).flat()

const imageSizeAfterRotation = (size: [number, number], degrees: number) => {
    degrees = degrees % 180
    if (degrees < 0) {
        degrees = 180 + degrees
    }
    if (degrees >= 90) {
        size = [size[1], size[0]]
        degrees = degrees - 90
    }
    if (degrees === 0) {
        return size
    }
    const radians = (degrees * Math.PI) / 180
    const width = size[0] * Math.cos(radians) + size[1] * Math.sin(radians)
    const height = size[0] * Math.sin(radians) + size[1] * Math.cos(radians)
    return [width, height]
}
