import { Point } from "./Point"
import { renderer } from "./renderer"
import { View } from "./View"

export enum ButtonState {
    DOWN,
    HELD,
    UP,
}

// enum referencing event.code
export enum InputKey {
    ZERO = "Digit0",
    ONE = "Digit1",
    TWO = "Digit2",
    THREE = "Digit3",
    FOUR = "Digit4",
    FIVE = "Digit5",
    SIX = "Digit6",
    SEVEN = "Digit7",
    EIGHT = "Digit8",
    NINE = "Digit9",
    Q = "KeyQ",
    W = "KeyW",
    E = "KeyE",
    R = "KeyR",
    T = "KeyT",
    Y = "KeyY",
    U = "KeyU",
    I = "KeyI",
    O = "KeyO",
    P = "KeyP",
    A = "KeyA",
    S = "KeyS",
    D = "KeyD",
    F = "KeyF",
    G = "KeyG",
    H = "KeyH",
    J = "KeyJ",
    K = "KeyK",
    L = "KeyL",
    Z = "KeyZ",
    X = "KeyX",
    C = "KeyC",
    V = "KeyV",
    B = "KeyB",
    N = "KeyN",
    M = "KeyM",
    MINUS = "Minus",
    EQUALS = "Equal",
    BACKSPACE = "Backspace",
    BRACKET_LEFT = "BracketLeft",
    BRACKET_RIGHT = "BracketRight",
    BACKSLASH = "Backslash",
    COMMA = "Comma",
    PERIOD = "Period",
    SLASH = "Slash",
    SHIFT_RIGHT = "ShiftRight",
    TAB = "Tab",
    SHIFT = "ShiftLeft",
    CONTROL = "ControlLeft",
    SPACE = "Space",
    ESC = "Escape",
    SEMICOLON = "Semicolon",
    QUOTE = "Quote",
    UP = "ArrowUp",
    DOWN = "ArrowDown",
    LEFT = "ArrowLeft",
    RIGHT = "ArrowRight",
    ENTER = "Enter",
}

export const InputKeyString = {
    for: (inputKey: InputKey): string => {
        if (inputKey.startsWith("Key")) {
            return inputKey.replace("Key", "")
        } else if (inputKey.startsWith("Digit")) {
            return inputKey.replace("Digit", "")
        }
        switch (inputKey) {
            case InputKey.COMMA:
                return ","
            case InputKey.PERIOD:
                return "."
            case InputKey.SEMICOLON:
                return ";"
            case InputKey.QUOTE:
                return '"'
            default:
                return inputKey
        }
    },
}

// enum referencing standard gamepad indexes https://w3c.github.io/gamepad/#remapping
export enum GamepadButton {
    X,
    CIRCLE,
    SQUARE,
    TRIANGLE,
    L1,
    R1,
    L2,
    R2,
    SELECT,
    START,
    L3,
    R3,
    UP,
    DOWN,
    LEFT,
    RIGHT,
    SUPER,
    TOUCHPAD,
}

export type GamepadVibrationOptions = {
    duration?: number
    strongMagnitude?: number
    weakMagnitude?: number
}

export enum MouseButton {
    LEFT = 0,
    RIGHT = 2,
}

type PointerType = "mouse" | "touch"

// TODO: Add globally-configured deadzones

export class CanvasInput {
    private readonly keys: Set<string> = new Set()
    private lastCapture: CapturedInput = new CapturedInput()
    private mousePos: Point = new Point(0, 0)
    private isMouseDown: boolean = false
    private isMouseHeld: boolean = false
    private isMouseUp: boolean = false
    private isRightMouseDown: boolean = false
    private isRightMouseHeld: boolean = false
    private isRightMouseUp: boolean = false
    private mouseWheelDeltaY: number = 0
    private pointerType: PointerType

    constructor(canvas: HTMLCanvasElement) {
        canvas.oncontextmenu = () => false

        const updatePointerInfo = (e: PointerEvent) => {
            this.mousePos = new Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop)
            this.pointerType = e.pointerType === "mouse" || !e.pointerType ? "mouse" : "touch"
        }

        canvas.onpointerdown = (e) => {
            updatePointerInfo(e)
            if (e.button === MouseButton.LEFT) {
                this.isMouseDown = true
                this.isMouseHeld = true
                this.isMouseUp = false
            } else if (e.button == MouseButton.RIGHT) {
                this.isRightMouseDown = true
                this.isRightMouseHeld = true
                this.isRightMouseUp = false
            }
        }
        canvas.onpointerup = (e) => {
            updatePointerInfo(e)
            if (e.button === MouseButton.LEFT) {
                this.isMouseDown = false
                this.isMouseHeld = false
                this.isMouseUp = true
            } else if (e.button === MouseButton.RIGHT) {
                this.isRightMouseDown = false
                this.isRightMouseHeld = false
                this.isRightMouseUp = true
            }
        }
        canvas.onpointermove = updatePointerInfo
        canvas.onwheel = (e) => (this.mouseWheelDeltaY = e.deltaY)
        window.onkeydown = (e) => this.keys.add(this.captureKey(e).code)
        window.onkeyup = (e) => this.keys.delete(this.captureKey(e).code)
    }

    _captureInput(): CapturedInput {
        const keys = Array.from(this.keys)
        const currentInput = new CapturedInput(
            new Set(keys.filter((key) => !this.lastCapture.isKeyHeld(key as InputKey))),
            new Set(keys.slice()),
            new Set(this.lastCapture.getKeysHeld().filter((key) => !this.keys.has(key))),
            this.mousePos,
            this.mousePos.minus(this.lastCapture.mousePos),
            this.isMouseDown,
            this.isMouseHeld,
            this.isMouseUp,
            this.isRightMouseDown,
            this.isRightMouseHeld,
            this.isRightMouseUp,
            this.mouseWheelDeltaY,
            this.pointerType,
            this.captureGamepads()
        )

        // reset since these should only be true for 1 tick
        this.isMouseDown = false
        this.isMouseUp = false
        this.isRightMouseDown = false
        this.isRightMouseUp = false
        this.mouseWheelDeltaY = 0

        this.lastCapture = currentInput

        return this.lastCapture
    }

    private captureKey(e: KeyboardEvent) {
        // TODO: Make captured keyset configurable for different games
        if (e.code === InputKey.TAB) {
            e.preventDefault()
        }
        return e
    }

    private captureGamepads() {
        return Object.values(navigator.getGamepads() || []).map((pad, gamepadIndex) => {
            if (!pad) {
                return undefined
            }
            const buttonValues = new Map<GamepadButton, number>()
            pad.buttons.forEach((b, i) => buttonValues.set(i, b.value))
            const lastGamepadCapture = this.lastCapture.gamepads[gamepadIndex]
            return new CapturedGamepad(pad, buttonValues, lastGamepadCapture)
        })
    }
}

export class CapturedGamepad {
    private readonly gamepad: Gamepad
    private readonly lastValues: Map<GamepadButton, number>
    private readonly buttonValues: Map<GamepadButton, number>

    constructor(
        gamepad: Gamepad,
        buttonValues: Map<GamepadButton, number>,
        lastCapture?: CapturedGamepad
    ) {
        this.gamepad = gamepad
        this.buttonValues = buttonValues
        this.lastValues = lastCapture?.buttonValues || new Map()
    }

    getLeftAxes() {
        return new Point(this.gamepad.axes[0], this.gamepad.axes[1])
    }

    getRightAxes() {
        return new Point(this.gamepad.axes[2], this.gamepad.axes[3])
    }

    isButtonDown(button: GamepadButton) {
        return !!(!this.lastValues.get(button) && this.buttonValues.get(button))
    }

    isButtonHeld(button: GamepadButton) {
        return !!this.buttonValues.get(button)
    }

    isButtonUp(button: GamepadButton) {
        return !!this.lastValues.get(button) && !this.buttonValues.get(button)
    }

    isButton(button: GamepadButton, state: ButtonState) {
        switch (state) {
            case ButtonState.DOWN:
                return this.isButtonDown(button)
            case ButtonState.HELD:
                return this.isButtonHeld(button)
            case ButtonState.UP:
                return this.isButtonUp(button)
        }
    }

    getButtonValue(button: GamepadButton) {
        return this.buttonValues.get(button)
    }

    vibrate({
        duration = 1000,
        // TODO verify different magnitudes do anything
        strongMagnitude = 1.0,
        weakMagnitude = 1.0,
    }: GamepadVibrationOptions = {}) {
        const vibrator = this.gamepad["vibrationActuator"]
        if (vibrator && typeof vibrator["playEffect"] === "function") {
            // "dual-rumble" is the only effect that is supported currently
            vibrator.playEffect("dual-rumble", {
                duration,
                strongMagnitude,
                weakMagnitude,
            })
        }
    }
}

export class CapturedInput {
    constructor(
        private readonly keysDown: Set<string> = new Set(),
        private readonly keysHeld: Set<string> = new Set(),
        private readonly keysUp: Set<string> = new Set(),
        readonly mousePos: Point = new Point(0, 0),
        readonly mousePosDelta: Point = new Point(0, 0),
        readonly isMouseDown: boolean = false,
        readonly isMouseHeld: boolean = false,
        readonly isMouseUp: boolean = false,
        readonly isRightMouseDown: boolean = false,
        readonly isRightMouseHeld: boolean = false,
        readonly isRightMouseUp: boolean = false,
        readonly mouseWheelDeltaY: number = 0,
        readonly pointerType: PointerType = "mouse",
        readonly gamepads: CapturedGamepad[] = []
    ) {}

    _scaledForView(view: View): CapturedInput {
        return new CapturedInput(
            this.keysDown,
            this.keysHeld,
            this.keysUp,
            this.mousePos.div(view.zoom).div(renderer.getScale()).minus(view.offset),
            this.mousePosDelta,
            this.isMouseDown,
            this.isMouseHeld,
            this.isMouseUp,
            this.isRightMouseDown,
            this.isRightMouseHeld,
            this.isRightMouseUp,
            this.mouseWheelDeltaY,
            this.pointerType,
            this.gamepads
        )
    }

    isMouse(button: MouseButton, state: ButtonState) {
        // TODO: Make this more dynamic and support more mouse buttons
        if (button === MouseButton.LEFT) {
            switch (state) {
                case ButtonState.DOWN:
                    return this.isMouseDown
                case ButtonState.HELD:
                    return this.isMouseHeld
                case ButtonState.UP:
                    return this.isMouseUp
            }
        } else {
            switch (state) {
                case ButtonState.DOWN:
                    return this.isRightMouseDown
                case ButtonState.HELD:
                    return this.isRightMouseHeld
                case ButtonState.UP:
                    return this.isRightMouseUp
            }
        }
    }

    getKeysHeld(): string[] {
        return Array.from(this.keysUp)
    }

    isKeyDown(key: InputKey): boolean {
        return this.keysDown.has(key)
    }

    isKeyHeld(key: InputKey): boolean {
        return this.keysHeld.has(key)
    }

    isKeyUp(key: InputKey): boolean {
        return this.keysUp.has(key)
    }

    isKey(key: InputKey, state: ButtonState) {
        switch (state) {
            case ButtonState.DOWN:
                return this.isKeyDown(key)
            case ButtonState.HELD:
                return this.isKeyHeld(key)
            case ButtonState.UP:
                return this.isKeyUp(key)
        }
    }
}
