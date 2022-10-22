import { AwakeData, StartData, UpdateData } from "./Engine"
import { Entity } from "./Entity"
import { RenderMethod } from "./renderer/RenderMethod"

export class Component {
    entity: Entity
    enabled: boolean = true
    get isStarted() {
        return this.start === ALREADY_STARTED_COMPONENT
    }

    /**
     * To simplify the programming model and reduce the need for class implementations of simple
     * one-off components, you can pass function overrides to the constructor. For example:
     *
     *     new Component({ update: (data) => {
     *         // do something every update cycle
     *     }})
     */
    constructor({
        awake,
        start,
        update,
        lateUpdate,
        getRenderMethods,
        delete: deleteFn,
    }: Partial<Component> = {}) {
        this.awake = awake ?? this.awake
        this.start = start ?? this.start
        this.update = update ?? this.update
        this.lateUpdate = lateUpdate ?? this.lateUpdate
        this.getRenderMethods = getRenderMethods ?? this.getRenderMethods
        this.delete = deleteFn ?? this.delete
    }

    /**
     * Called once, immediately after entity is defined and before start() is called.
     * It is safe to add additional components to the entity in this function.
     */
    awake(awakeData: AwakeData) {}

    /**
     * Called once, after the component is added to a valid entity and before update() is called
     */
    start(startData: StartData) {}

    /**
     * Called on each update step, before rendering
     */
    update(updateData: UpdateData) {}

    /**
     * Called on each update step, after rendering
     */
    lateUpdate(updateData: UpdateData) {}

    /**
     * Should be overridden by renderable components
     */
    getRenderMethods(): RenderMethod[] {
        return []
    }

    /**
     * Override if custom logic is desired when a component or parent entity is deleted
     */
    delete() {
        this.entity?.removeComponent(this)
    }
}

export const ALREADY_STARTED_COMPONENT = () => {
    throw new Error("start() has already been called on this component")
}
