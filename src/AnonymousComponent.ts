import { Component } from "./Component"

export class AnonymousComponent extends Component {
    /**
     * To simplify the programming model and reduce the need for class implementations of simple
     * one-off components, you can pass function overrides to the constructor. For example:
     *
     *     new AnonymousComponent({ update: (data) => {
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
        super()
        this.awake = awake ?? this.awake
        this.start = start ?? this.start
        this.update = update ?? this.update
        this.lateUpdate = lateUpdate ?? this.lateUpdate
        this.getRenderMethods = getRenderMethods ?? this.getRenderMethods
        this.delete = deleteFn ?? this.delete
    }
}
