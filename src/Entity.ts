import { Component } from "./Component"
import { AbstractType } from "./Types"

/**
 * An object which is updated by the engine. Should be attached to a game view.
 * An Entity is essentially a logical grouping of components.
 */
export class Entity {
    components: Component[] = []

    private componentCache: Map<object, object[]> = new Map()

    constructor(components: Component[] = []) {
        components.forEach((c) => this.addComponent(c))
    }

    addComponent<T extends Component>(component: T): T {
        if (!component) {
            return
        }

        this.componentCache.clear()

        component.entity = this
        this.components.push(component)
        component.awake({})
        return component
    }

    addComponents<T extends Component>(components: T[]): T[] {
        components.forEach((e) => this.addComponent(e))
        return components
    }

    getComponent<T extends Component>(componentType: AbstractType<T>): T | undefined {
        return this.getComponents(componentType)[0]
    }

    getComponents<T extends Component>(componentType: AbstractType<T>): T[] {
        let value = this.componentCache.get(componentType)
        if (value === undefined) {
            value = this.components.filter((c) => c instanceof componentType)
            this.componentCache.set(componentType, value)
        }
        return value as T[]
    }

    removeComponent(component: Component) {
        this.componentCache.clear()

        this.components = this.components.filter((c) => c !== component)
        component.entity = null
    }

    /**
     * Disables and removes all components.
     * Passing a self-destructed entity to the engine will have no effects.
     */
    selfDestruct() {
        this.components.forEach((c) => c.delete())
    }
}
