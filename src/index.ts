// Singletons
import { assets } from "./Assets"
import { debug } from "./Debug"
import { profiler } from "./Profiler"

import { Component } from "./Component"
import { AwakeData, Engine, StartData, UpdateData, UpdateViewsContext } from "./Engine"
import { Entity } from "./Entity"
import { Game } from "./Game"
import {
    ButtonState,
    CapturedGamepad,
    CapturedInput,
    GamepadButton,
    GamepadVibrationOptions,
    Input,
    InputKey,
    InputKeyString,
    MouseButton,
} from "./Input"
import { Point } from "./Point"

import type { AbstractType, ConcreteType } from "./Types"

export {
    assets,
    debug,
    profiler,
    Component,
    Entity,
    UpdateViewsContext,
    Engine,
    AwakeData,
    StartData,
    UpdateData,
    Game,
    ButtonState,
    InputKey,
    InputKeyString,
    GamepadButton,
    GamepadVibrationOptions,
    MouseButton,
    Input,
    CapturedGamepad,
    CapturedInput,
    Point,
}
export type { AbstractType, ConcreteType }
