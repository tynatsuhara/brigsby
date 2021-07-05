/**
 * Used for specifying a possibly-abstract type
 */
export type AbstractType<T> = Function & { prototype: T }

/**
 * Used for specifying a concrete type which can be constructed
 */
export interface ConcreteType<T> { new(...args: any[]): T }
