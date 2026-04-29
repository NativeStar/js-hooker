export const OriginObjects = {
    AbortController,
    TypeError,
    Promise,
    Array: {
        some: Array.prototype.some,
        push: Array.prototype.push,
        filter: Array.prototype.filter,
        join: Array.prototype.join,
        splice: Array.prototype.splice
    },
    Object: {
        freeze: Object.freeze,
    },
    Reflect: {
        apply: Reflect.apply,
        construct: Reflect.construct,
        has: Reflect.has,
        get: Reflect.get,
        set: Reflect.set,
        defineProperty: Reflect.defineProperty,
        getOwnPropertyDescriptor: Reflect.getOwnPropertyDescriptor,
        deleteProperty: Reflect.deleteProperty
    },
    Function: {
        toString: Function.prototype.toString,
        bind: Function.prototype.bind
    },
    Proxy,
    String: {
        toString: String.prototype.toString,
        includes: String.prototype.includes,
        split: String.prototype.split as (this: string, separator: string | RegExp, limit?: number) => string[]
    },
    console: {
        log: console.log,
        warn: console.warn,
        error: console.error
    },
    MapObject: Map,
    Map: {
        get: Map.prototype.get,
        set: Map.prototype.set,
        delete: Map.prototype.delete
    },
    WeakMap: {
        get: WeakMap.prototype.get,
        set: WeakMap.prototype.set,
        delete: WeakMap.prototype.delete
    }
}
OriginObjects.Object.freeze(OriginObjects);