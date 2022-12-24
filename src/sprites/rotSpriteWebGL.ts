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

let vshader = `
	attribute vec4 position;
	attribute vec2 texCoord;
	uniform mediump int isUpscale; // acts like a boolean
	uniform mediump vec2 resolution;
	uniform vec2 translation;
	uniform mat4 scale;
	uniform mat4 rotation;
	varying vec2 v_texCoord;
	void main() {
		if (isUpscale == 0) {
			// Rotate, translate and downscale
			vec2 zeroToOne = vec2(rotation * position) / resolution;
			vec2 zeroToTwo = zeroToOne * 2.0;
			vec2 clipSpace = zeroToTwo - 1.0;
			vec4 rotatedPos = vec4(clipSpace + 1.0, 1.0, 1.0);
			gl_Position = (scale * vec4(clipSpace + translation, 1.0, 1.0));
		} else {
			gl_Position = position;
		};
  		v_texCoord = texCoord;
	}
`
let fshader = `
  precision mediump float;
  uniform sampler2D sampler;
  uniform int isUpscale;
  uniform vec2 resolution;
  varying vec2 v_texCoord;
  
  void main() {
    vec4 P = texture2D(sampler, v_texCoord);
    if (isUpscale > 0) {
      // EPX Scale
      vec4 A; vec4 B; vec4 C; vec4 D;
      vec4 color = P;
      float pixw = 1.0 / resolution.x;
      float pixh = 1.0 / resolution.y;
      if (gl_FragCoord.y > 1.0) {
        vec2 newTexCoord = vec2(v_texCoord.x, v_texCoord.y - (2.0*pixh));
        A = texture2D(sampler, newTexCoord);
      } else {
      A = P;
      };
      if (gl_FragCoord.x < (resolution.x-2.0)) {
        vec2 newTexCoord = vec2(v_texCoord.x + (2.0*pixw), v_texCoord.y);
        B = texture2D(sampler, newTexCoord);
      } else {
      B = P;
      };
      if (gl_FragCoord.x > 1.0) {
        vec2 newTexCoord = vec2(v_texCoord.x - (2.0*pixw), v_texCoord.y);
        C = texture2D(sampler, newTexCoord);
      } else {
      C = P;
      };
      if (gl_FragCoord.y < (resolution.y-2.0)) {
        vec2 newTexCoord = vec2(v_texCoord.x, v_texCoord.y + (2.0*pixh));
        D = texture2D(sampler, newTexCoord);
      } else {
      D = P;
      };
    // Shift gl_FragCoord by 0.5 pixel
    vec4 FragCoordShifted = gl_FragCoord - vec4(0.5, 0.5, 0.0, 0.0);
    // Override color value
      if (mod(FragCoordShifted.x, 2.0) == 0.0 && mod(FragCoordShifted.y, 2.0) == 0.0) {
        if ((C == A) && (C != D) && (A != B)) {
          color = A;
        };
        
      } else if (mod(FragCoordShifted.x, 2.0) != 0.0 && mod(FragCoordShifted.y, 2.0) == 0.0) {
        if ((A == B) && (A != C) && (B != D)) {
          color = B;
        };
      } else if (mod(FragCoordShifted.x, 2.0) == 0.0 && mod(FragCoordShifted.y, 2.0) != 0.0) {
        if ((D == C) && (D != B) && (C != A)) {
          color = C;
        };
      } else if (mod(FragCoordShifted.x, 2.0) != 0.0 && mod(FragCoordShifted.y, 2.0) != 0.0) {
        if ((B == D) && (B != A) && (D != C)) {
          color = D;
        };
      };
    gl_FragColor = color;
    } else {
      gl_FragColor = P;
    }
  }
`

export const rotSpriteWebGL = (
    imageSource: CanvasImageSource,
    sourcePosition: Point,
    sourceDimensions: Point,
    degree: number
): HTMLCanvasElement | OffscreenCanvas => {
    const sourceCanvas = document.createElement("canvas")
    sourceCanvas.width = sourceDimensions.x
    sourceCanvas.height = sourceDimensions.y
    const sourceContext = sourceCanvas.getContext("2d")
    sourceContext.drawImage(
        imageSource,
        sourcePosition.x,
        sourcePosition.y,
        sourceDimensions.x,
        sourceDimensions.y,
        0,
        0,
        sourceDimensions.x,
        sourceDimensions.y
    )

    const image = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)

    const canvas = document.createElement("canvas")
    const SCALE = 8
    const gl = canvas.getContext("webgl", { antialias: false })
    if (!gl) {
        throw new Error("No GL")
    }
    const program = compile(gl, vshader, fshader)
    if (!program) {
        throw new Error("No program")
    }

    if (debug.spriteRotateDebug) {
        console.log("MAX_TEXTURE_SIZE is: ", gl.getParameter(gl.MAX_TEXTURE_SIZE))
    }

    // Locations
    const resolution = gl.getUniformLocation(program, "resolution")
    const translation = gl.getUniformLocation(program, "translation")
    const scale = gl.getUniformLocation(program, "scale")
    const rotation = gl.getUniformLocation(program, "rotation")
    const isUpscale = gl.getUniformLocation(program, "isUpscale")
    const position = gl.getAttribLocation(program, "position")
    const texCoord = gl.getAttribLocation(program, "texCoord")
    const sampler = gl.getUniformLocation(program, "sampler")

    // Enable EPX Scale
    gl.uniform1i(isUpscale, 1)

    // Create the buffer object
    const verticesTexCoords = new Float32Array([
        -1, 1, 0.0, 1.0, -1, -1, 0.0, 0.0, 1, 1, 1.0, 1.0, 1, -1, 1.0, 0.0,
    ])
    const N = 4
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
    const vertexTexCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)

    // Use every 1st and 2nd float for position
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, FSIZE * 4, 0)
    gl.enableVertexAttribArray(position)

    // Use every 3rd and 4th float for texCoord
    gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
    gl.enableVertexAttribArray(texCoord)

    // Texture
    const texture = gl.createTexture()

    // Reset flip
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Stretch/wrap options
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    // Pass texture 0 to the sampler
    gl.uniform1i(sampler, 0)

    const { width: naturalWidth, height: naturalHeight } = image

    if (naturalWidth > 512 || naturalHeight > 512) {
        throw new Error("Size exceeded")
    }
    let currW = 0
    let currH = 0

    for (let i = 2; i <= SCALE; i *= 2) {
        // Uploading the image
        if (i === 2 && image) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas)
        }

        currW = naturalWidth * i
        currH = naturalHeight * i

        gl.uniform2f(resolution, currW, currH)

        gl.canvas.width = currW
        gl.canvas.height = currH
        gl.viewport(0, 0, currW, currH)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, N)
    }

    const verticesTexCoordsInPixels = new Float32Array([
        -currW / 2,
        currH / 2,
        0.0,
        1.0,
        -currW / 2,
        -currH / 2,
        0.0,
        0.0,
        currW / 2,
        currH / 2,
        1.0,
        1.0,
        currW / 2,
        -currH / 2,
        1.0,
        0.0,
    ])

    // buffer object
    const vertexTexCoordBuffer2 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer2)
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoordsInPixels, gl.STATIC_DRAW)

    // Updating position attribute
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, FSIZE * 4, 0)
    gl.enableVertexAttribArray(position)

    // Flip the image's y axis if scale == 4
    // if (SCALE == 4) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Upload image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas)

    // Rotating the image
    gl.uniform1i(isUpscale, 0)

    const cosA = Math.cos((degree * Math.PI) / 180)
    const sinA = Math.sin((degree * Math.PI) / 180)

    const rotCornerX = Math.round((currW / 2) * cosA + (currH / 2) * sinA)
    const rotCornerY = Math.round((currH / 2) * cosA - (currW / 2) * sinA)

    const rotCorner2X = Math.round((-currW / 2) * cosA + (currH / 2) * sinA)
    const rotCorner2Y = Math.round((currH / 2) * cosA - (-currW / 2) * sinA)

    const maxPosX = Math.max(Math.abs(rotCornerX), Math.abs(rotCorner2X))
    const maxPosY = Math.max(Math.abs(rotCornerY), Math.abs(rotCorner2Y))

    const rotW = maxPosX * 2
    const rotH = maxPosY * 2

    // Rotate matrix
    const r_matrix = new Float32Array([
        cosA,
        -sinA,
        0.0,
        0.0,
        sinA,
        cosA,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    ])
    gl.uniformMatrix4fv(rotation, false, r_matrix)

    // Translation vector
    const translateX = -(currW - rotW / SCALE - naturalWidth) / naturalWidth
    const translateY = -(currH - rotH / SCALE - naturalHeight) / naturalHeight
    gl.uniform2f(translation, translateX, translateY)

    // Scale matrix
    const S = 1 / SCALE
    const s_matrix = new Float32Array([
        S,
        0.0,
        0.0,
        0.0,
        0.0,
        S,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    ])
    gl.uniformMatrix4fv(scale, false, s_matrix)

    gl.canvas.width = Math.round(rotW / SCALE)
    gl.canvas.height = Math.round(rotH / SCALE)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N)

    // export image data
    return gl.canvas
}

const compile = (gl: WebGLRenderingContext, vshader: string, fshader: string) => {
    const vs = gl.createShader(gl.VERTEX_SHADER)
    if (vs) {
        gl.shaderSource(vs, vshader)
        gl.compileShader(vs)
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (fs) {
        gl.shaderSource(fs, fshader)
        gl.compileShader(fs)
    }

    const program = gl.createProgram()
    if (program && vs && fs) {
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        gl.useProgram(program)

        if (debug.spriteRotateDebug) {
            console.log("vertex shader: ", gl.getShaderInfoLog(vs) || "OK")
            console.log("fragment shader: ", gl.getShaderInfoLog(fs) || "OK")
            console.log("program: ", gl.getProgramInfoLog(program) || "OK")
        }
    }

    return program
}
