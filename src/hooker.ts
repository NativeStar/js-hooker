import { OriginObjects } from "./originObjects.js";
import { createBypassToStringMethod, filterErrorStack } from "./util.js";
import type { AnyFunctionType, MethodByName, TempHookResultWrapper, MethodHookOption, AccessorHookOption, AccessorHookMapItem, MethodHookMapItem, ObjectHookOption, ObjectHookMapItem, ConstructorPropertyName, AnyConstructorType, HookType, HookerConstruct } from "./types.js"
import { StaticMethods } from "./staticMethods.js";
export class Hooker extends StaticMethods {
    private readonly hookedMethodMap: WeakMap<object, Map<string, MethodHookMapItem>> = new WeakMap();
    private readonly hookedAccessorMap: WeakMap<object, Map<string, AccessorHookMapItem>> = new WeakMap();
    private readonly hookedObjectMap: WeakMap<object, Map<string, ObjectHookMapItem>> = new WeakMap();
    private readonly HOOKED_SYMBOL = Symbol();
    private readonly GET_ORIGIN_METHOD_SYMBOL = Symbol();
    private originObjectReference = OriginObjects;
    constructor(option: HookerConstruct) {
        super(option);
        if (option.originReference) this.originObjectReference = option.originReference;
    }
    setOriginObjectSource(source: typeof OriginObjects) {
        this.originObjectReference = source;
    }
    hookMethod<P extends object, K extends keyof P, F extends Extract<P[K], AnyFunctionType>, T = ReturnType<F>>(parent: P, target: K, hookOption: MethodHookOption<F>): boolean;
    hookMethod<P extends object, K extends string, F extends MethodByName<P, K> = MethodByName<P, K>>(parent: P, target: K, hookOption: MethodHookOption<F>): boolean;
    hookMethod(parent: any, methodName: string, hookOption: MethodHookOption<AnyFunctionType>): boolean {
        try {
            if (!parent || typeof parent[methodName] !== 'function') {
                return false;
            }
            const methodExecutable = this.originObjectReference.Reflect.get(parent, methodName) as AnyFunctionType;
            let originMethod: Function = methodExecutable;
            //Proxy方法和原始方法在Map眼中不一样
            if (this.isHooked(methodExecutable)) {
                const rawOrigin = this.getOriginExecutable(methodExecutable);
                if (rawOrigin !== null) originMethod = rawOrigin
            }
            const currentHookMethodItem = this.getHookItem("method", parent, methodName)
            if (currentHookMethodItem) {
                //判断id是否重复
                if (hookOption.id && this.originObjectReference.Reflect.apply(this.originObjectReference.Array.some, currentHookMethodItem.option, [item => item.id === hookOption.id])) {
                    this.originObjectReference.console.warn(`already has method hook id:${hookOption.id}`);
                    return false
                }
                this.originObjectReference.Reflect.apply(this.originObjectReference.Array.push, currentHookMethodItem.option, [hookOption]);
                return true
            }
            // 屏蔽枚举和重写
            this.originObjectReference.Reflect.defineProperty(originMethod, 'toString', {
                value: createBypassToStringMethod(this.originObjectReference, methodName),
                writable: false,
                enumerable: false,
                configurable: true,
            });
            const hookEntryProxy = new this.originObjectReference.Proxy(originMethod, {
                apply: (_target, thisArg, args) => {
                    const hookItem = this.getHookItem("method", parent, methodName)
                    if (!hookItem || hookItem.option.length === 0) {
                        try {
                            //没有hook
                            return this.originObjectReference.Reflect.apply(originMethod, thisArg, args);
                        } catch (error: any) {
                            if (error.stack) {
                                error.stack = filterErrorStack(this.originObjectReference, error.stack);
                            }
                            throw error;
                        }
                    }
                    const tempResult: TempHookResultWrapper<ReturnType<typeof methodExecutable>> = {
                        current: undefined
                    }
                    const abortController = new this.originObjectReference.AbortController();
                    for (const currentHookOption of hookItem.option) {
                        currentHookOption.beforeMethodInvoke?.(args, abortController, thisArg, tempResult, originMethod as AnyFunctionType);
                    }
                    if (abortController.signal.aborted) {
                        return tempResult.current;
                    }
                    try {
                        tempResult.current = this.originObjectReference.Reflect.apply(originMethod, thisArg, args);
                    } catch (error: any) {
                        if (error.stack) {
                            error.stack = filterErrorStack(this.originObjectReference, error.stack);
                        }
                        throw error;
                    }
                    for (const currentHookOption of hookItem.option) {
                        currentHookOption.afterMethodInvoke?.(args, tempResult, thisArg, originMethod as AnyFunctionType);
                    }
                    return tempResult.current;
                },
                has: (target, p) => {
                    if (p === this.HOOKED_SYMBOL) {
                        return true;
                    }
                    return this.originObjectReference.Reflect.has(target, p);
                },
                get: (target, p) => {
                    if (p === this.GET_ORIGIN_METHOD_SYMBOL) {
                        return originMethod;
                    }
                    return this.originObjectReference.Reflect.get(target, p);
                }
            });
            const originDescriptor = this.originObjectReference.Reflect.getOwnPropertyDescriptor(parent, methodName) ?? {
                configurable: true,
                writable: true,
                enumerable: true,
            }
            // 下面三个属性只有第一个hook的可以生效
            const hookDefineResult = this.originObjectReference.Reflect.defineProperty(parent, methodName, {
                value: hookEntryProxy,
                writable: hookOption.descriptor?.writable ?? originDescriptor.writable ?? true,
                enumerable: hookOption.descriptor?.enumerable ?? originDescriptor.enumerable ?? true,
                configurable: hookOption.descriptor?.configurable ?? originDescriptor.configurable ?? true,
            });
            if (hookDefineResult) {
                const hookItem: MethodHookMapItem = {
                    originParent: parent,
                    originMethod: originMethod as AnyFunctionType,
                    methodName,
                    option: [hookOption]
                }
                this.setHookItem("method", parent, methodName, hookItem);
                return true;
            }
            return false;
        } catch (error) {
            this.originObjectReference.console.warn("Error on hooking method:", error);
            return false;
        }
    }

    hookAsyncMethod<P extends object, K extends keyof P, F extends Extract<P[K], AnyFunctionType>, T = Awaited<ReturnType<F>>>(parent: P, target: K, hookOption: MethodHookOption<F, Awaited<ReturnType<F>>>): boolean;
    hookAsyncMethod<P extends object, K extends string, F extends MethodByName<P, K> = MethodByName<P, K>>(parent: P, target: K, hookOption: MethodHookOption<F, Awaited<ReturnType<F>>>): boolean;
    hookAsyncMethod(parent: Record<string, any>, methodName: string, hookOption: MethodHookOption<AnyFunctionType>): boolean {
        try {
            if (!parent || typeof parent[methodName] !== 'function') {
                return false;
            }
            const methodExecutable = this.originObjectReference.Reflect.get(parent, methodName) as AnyFunctionType;
            let originMethod: Function = methodExecutable;
            if (this.isHooked(methodExecutable)) {
                const rawOrigin = this.getOriginExecutable(methodExecutable);
                if (rawOrigin !== null) originMethod = rawOrigin
            }
            const currentHookMethodItem = this.getHookItem("method", parent, methodName)
            if (currentHookMethodItem) {
                //判断id是否重复
                if (hookOption.id && this.originObjectReference.Reflect.apply(this.originObjectReference.Array.some, currentHookMethodItem.option, [item => item.id === hookOption.id])) {
                    this.originObjectReference.console.warn(`already has async method hook id:${hookOption.id}`);
                    return false
                }
                this.originObjectReference.Reflect.apply(this.originObjectReference.Array.push, currentHookMethodItem.option, [hookOption]);
                return true
            }
            try {
                this.originObjectReference.Reflect.defineProperty(originMethod, 'toString', {
                    value: createBypassToStringMethod(this.originObjectReference, methodName),
                    writable: false,
                    enumerable: false,
                    configurable: true,
                });
            } catch (error) {
                this.originObjectReference.console.warn("Error on create bypass toString detect method:", error);
            }
            const hookEntry = new this.originObjectReference.Proxy(originMethod, {
                apply: (_target, thisArg, args) => {
                    return new this.originObjectReference.Promise<any>(async (resolve, reject) => {
                        const hookItem = this.getHookItem("method", parent, methodName)
                        if (!hookItem || hookItem.option.length == 0) {
                            try {
                                resolve(await this.originObjectReference.Reflect.apply(originMethod, thisArg, args))
                                return
                            } catch (error: any) {
                                if (error.stack) {
                                    error.stack = filterErrorStack(this.originObjectReference, error.stack);
                                }
                                reject(error as Error)
                                return
                            }
                        }
                        const tempResult: TempHookResultWrapper<Awaited<ReturnType<typeof methodExecutable>>> = {
                            current: undefined
                        }
                        const abortController = new this.originObjectReference.AbortController();
                        for (const currentHookOption of hookItem.option) {
                            currentHookOption.beforeMethodInvoke?.(args, abortController, thisArg, tempResult, originMethod as AnyFunctionType);
                        }
                        if (abortController.signal.aborted) {
                            resolve(tempResult.current);
                            return
                        }
                        try {
                            tempResult.current = await this.originObjectReference.Reflect.apply(originMethod, thisArg, args)
                        } catch (error: any) {
                            if (error.stack) {
                                error.stack = filterErrorStack(this.originObjectReference, error.stack);
                            }
                            reject(error as Error)
                            return
                        }
                        for (const currentHookOption of hookItem.option) {
                            currentHookOption.afterMethodInvoke?.(args, tempResult, thisArg, originMethod as AnyFunctionType);
                        }
                        resolve(tempResult.current);
                    })
                },
                has: (target, p) => {
                    if (p === this.HOOKED_SYMBOL) {
                        return true;
                    }
                    return this.originObjectReference.Reflect.has(target, p);
                },
                get: (target, p) => {
                    if (p === this.GET_ORIGIN_METHOD_SYMBOL) {
                        return originMethod;
                    }
                    return this.originObjectReference.Reflect.get(target, p);
                }
            })
            const originDescriptor = this.originObjectReference.Reflect.getOwnPropertyDescriptor(parent, methodName) ?? {
                configurable: true,
                writable: true,
                enumerable: true,
            }
            const hookDefineResult = this.originObjectReference.Reflect.defineProperty(parent, methodName, {
                value: hookEntry,
                writable: hookOption.descriptor?.writable ?? originDescriptor.writable ?? true,
                enumerable: hookOption.descriptor?.enumerable ?? originDescriptor.enumerable ?? true,
                configurable: hookOption.descriptor?.configurable ?? originDescriptor.configurable ?? true,
            });
            if (hookDefineResult) {
                const hookItem: MethodHookMapItem = {
                    originParent: parent,
                    originMethod: originMethod as AnyFunctionType,
                    methodName,
                    option: [hookOption]
                }
                this.setHookItem("method", parent, methodName, hookItem);
                return true;
            }
            return false;
        } catch (error) {
            this.originObjectReference.console.warn("Error on hooking async method:", error);
            return false;
        }
    }
    hookAccessor<P extends object, K extends keyof P>(parent: P, target: K, hookOption: AccessorHookOption<P, K>): boolean;
    hookAccessor(parent: any, target: string, hookOption: AccessorHookOption<any, any>) {
        if (!parent) return false
        const currentHookItem = this.getHookItem("accessor", parent, target);
        if (currentHookItem) {
            //判断id是否重复
            if (hookOption.id && this.originObjectReference.Reflect.apply(this.originObjectReference.Array.some,currentHookItem.option, [item => item.id === hookOption.id])) {
                this.originObjectReference.console.warn(`already has accessor hook id:${hookOption.id}`);
                return false
            }
            this.originObjectReference.Reflect.apply(this.originObjectReference.Array.push,currentHookItem.option, [hookOption]);
            return true
        }
        const originDescriptor = this.originObjectReference.Reflect.getOwnPropertyDescriptor(parent, target);
        // 拿不到描述符
        if (!originDescriptor) return false;
        let originGetter: (() => any) | undefined = originDescriptor.get;
        let originSetter: ((value: any) => void) | undefined = originDescriptor.set;
        // 啥都没有...
        if (!originGetter && !originSetter) return false
        if (originGetter && this.isHooked(originGetter)) {
            const tryGetter = this.getOriginExecutable(originGetter);
            if (tryGetter) originGetter = tryGetter;
        }
        if (originSetter && this.isHooked(originSetter)) {
            const trySetter = this.getOriginExecutable(originSetter);
            if (trySetter) originSetter = trySetter;
        }
        const tempHookEntry: { getter: (() => any) | undefined, setter: ((value: any) => void) | undefined } = { getter: originGetter, setter: originSetter }
        if (originGetter) {
            this.originObjectReference.Reflect.defineProperty(originGetter, 'toString', {
                value: createBypassToStringMethod(this.originObjectReference, target, "get"),
                writable: false,
                enumerable: true,
                configurable: true,
            });
            tempHookEntry.getter = new this.originObjectReference.Proxy(originGetter, {
                apply: (_target, thisArg) => {
                    const hookItem = this.getHookItem("accessor", parent, target);
                    if (!hookItem || hookItem.option.length == 0) {
                        try {
                            //没有hook
                            return this.originObjectReference.Reflect.apply(originGetter, thisArg, []);
                        } catch (error: any) {
                            if (error.stack) {
                                error.stack = filterErrorStack(this.originObjectReference, error.stack);
                            }
                            throw error;
                        }
                    }
                    const tempResult: TempHookResultWrapper<ReturnType<typeof originGetter>> = {
                        current: undefined
                    }
                    const abortController = new this.originObjectReference.AbortController();
                    for (const currentHookOption of hookItem.option) {
                        currentHookOption.beforeGetterInvoke?.(abortController, thisArg, tempResult);
                    }
                    if (abortController.signal.aborted) {
                        return tempResult.current ?? undefined;
                    }
                    try {
                        tempResult.current = this.originObjectReference.Reflect.apply(originGetter, thisArg, []);
                    } catch (error: any) {
                        if (error.stack) {
                            error.stack = filterErrorStack(this.originObjectReference, error.stack);
                        }
                        throw error;
                    }
                    for (const currentHookOption of hookItem.option) {
                        currentHookOption.afterGetterInvoke?.(tempResult, thisArg);
                    }
                    return tempResult.current;
                },
                has: (target, p) => {
                    if (p === this.HOOKED_SYMBOL) {
                        return true;
                    }
                    return this.originObjectReference.Reflect.has(target, p);
                },
                get: (target, p) => {
                    if (p === this.GET_ORIGIN_METHOD_SYMBOL) {
                        return originGetter;
                    }
                    return this.originObjectReference.Reflect.get(target, p);
                },
            });
        }
        if (originSetter) {
            this.originObjectReference.Reflect.defineProperty(originSetter, 'toString', {
                value: createBypassToStringMethod(this.originObjectReference, target, "set"),
                writable: false,
                enumerable: true,
                configurable: true,
            });
            tempHookEntry.setter = new this.originObjectReference.Proxy(originSetter, {
                apply: (_target, thisArg, arg: [any]) => {
                    const hookItem = this.getHookItem("accessor", parent, target);
                    if (!hookItem || hookItem.option.length == 0) {
                        try {
                            //没有hook
                            return this.originObjectReference.Reflect.apply(originSetter, thisArg, arg);
                        } catch (error: any) {
                            if (error.stack) {
                                error.stack = filterErrorStack(this.originObjectReference, error.stack);
                            }
                            throw error;
                        }
                    }
                    const abortController = new this.originObjectReference.AbortController();
                    for (const currentHookOption of hookItem.option) {
                        currentHookOption.beforeSetterInvoke?.(arg[0], abortController, thisArg);
                    }
                    if (abortController.signal.aborted) {
                        return
                    }
                    try {
                        this.originObjectReference.Reflect.apply(originSetter, thisArg, arg);
                    } catch (error: any) {
                        if (error.stack) {
                            error.stack = filterErrorStack(this.originObjectReference, error.stack);
                        }
                        throw error;
                    }
                    return
                },
                has: (target, p) => {
                    if (p === this.HOOKED_SYMBOL) {
                        return true;
                    }
                    return this.originObjectReference.Reflect.has(target, p);
                },
                get: (target, p) => {
                    if (p === this.GET_ORIGIN_METHOD_SYMBOL) {
                        return originSetter;
                    }
                    return this.originObjectReference.Reflect.get(target, p);
                },
            });
        }
        const hookDefineResult = this.originObjectReference.Reflect.defineProperty(parent, target, {
            get: tempHookEntry.getter,
            set: tempHookEntry.setter,
            enumerable: hookOption.descriptor?.enumerable ?? true,
            configurable: hookOption.descriptor?.configurable ?? true,
        });
        if (hookDefineResult) {
            const hookItem: AccessorHookMapItem = {
                originGetter: originGetter ?? null,
                originSetter: originSetter ?? null,
                option: [hookOption]
            }
            this.setHookItem("accessor", parent, target, hookItem);
            return true;
        }
        return false;
    }
    hookObject<P extends object, K extends ConstructorPropertyName<P>>(parent: P, target: K, hookOption: ObjectHookOption<Extract<P[K], AnyConstructorType>>): boolean;
    hookObject<T extends AnyConstructorType>(parent: object, target: string, hookOption: ObjectHookOption<T>): boolean
    hookObject(parent: any, objectName: string, hookOption: ObjectHookOption<AnyConstructorType>): boolean {
        try {
            // 只支持hook构造函数
            if (!parent || typeof parent[objectName] !== 'function') {
                return false;
            }
            const rawObject = this.originObjectReference.Reflect.get(parent, objectName);
            let originObject: Function = rawObject;
            if (this.isHooked(rawObject)) {
                const tempOriginObject = this.getOriginExecutable(rawObject);
                if (tempOriginObject !== null) originObject = tempOriginObject
            }
            const currentHookItem = this.getHookItem("object", parent, objectName);
            if (currentHookItem) {
                if (hookOption.id && this.originObjectReference.Reflect.apply(this.originObjectReference.Array.some, currentHookItem.option, [item => item.id === hookOption.id])) {
                    this.originObjectReference.console.warn(`already has object hook id:${hookOption.id}`);
                    return false;
                }
                this.originObjectReference.Reflect.apply(this.originObjectReference.Array.push, currentHookItem.option, [hookOption]);
                return true;
            }
            this.originObjectReference.Reflect.defineProperty(originObject, "toString", {
                value: createBypassToStringMethod(this.originObjectReference, objectName),
                writable: false,
                enumerable: false,
                configurable: true,
            });
            const hookProxy = new this.originObjectReference.Proxy(originObject, {
                get: (target, p, receiver) => {
                    if (p === this.GET_ORIGIN_METHOD_SYMBOL) {
                        return originObject;
                    }
                    const hookItems = this.getHookItem("object", parent, objectName);
                    const tempResult: TempHookResultWrapper<any> = { current: this.originObjectReference.Reflect.get(target, p, receiver) };
                    if (!hookItems || hookItems.option.length == 0) {
                        //没有hook
                        return tempResult.current;
                    }
                    for (const hookOption of hookItems.option) {
                        hookOption.afterGet?.(p, tempResult)
                    }
                    return tempResult.current;
                },
                has: (target, p) => {
                    if (p === this.HOOKED_SYMBOL) {
                        return true;
                    }
                    const hookItems = this.getHookItem("object", parent, objectName);
                    const tempResult: TempHookResultWrapper<any> = { current: this.originObjectReference.Reflect.has(target, p) };
                    if (!hookItems || hookItems.option.length == 0) {
                        //没有hook
                        return tempResult.current;
                    }
                    for (const hookOption of hookItems.option) {
                        hookOption.afterHas?.(p, tempResult)
                    }
                    return tempResult.current;
                },
                construct: (target, argArray, newTarget) => {
                    const hookItems = this.getHookItem("object", parent, objectName);
                    const tempResult: TempHookResultWrapper<any> = { current: null };
                    if (!hookItems || hookItems.option.length == 0) {
                        try {
                            //没有hook
                            return this.originObjectReference.Reflect.construct(target, argArray, newTarget)
                        } catch (error: any) {
                            if (error.stack) {
                                error.stack = filterErrorStack(this.originObjectReference, error.stack);
                            }
                            throw error;
                        }
                    }
                    try {
                        const abortController = new this.originObjectReference.AbortController();
                        for (const beforeHookOption of hookItems.option) {
                            beforeHookOption?.beforeConstruct?.(argArray, abortController, tempResult, target as AnyConstructorType);
                        }
                        if (abortController.signal.aborted) {
                            return tempResult.current;
                        }
                        tempResult.current = this.originObjectReference.Reflect.construct(target, argArray, newTarget);
                        for (const afterHookOption of hookItems.option) {
                            afterHookOption.afterConstruct?.(argArray, tempResult, target as AnyConstructorType)
                        }
                    } catch (error: any) {
                        if (error.stack) {
                            error.stack = filterErrorStack(this.originObjectReference, error.stack);
                        }
                        throw error;
                    }
                    return tempResult.current;
                },
                set: (target, p, newValue, receiver) => {
                    const hookItems = this.getHookItem("object", parent, objectName);
                    //用于修改set值
                    const tempNewValue: TempHookResultWrapper<any> = { current: newValue };
                    //用于修改trap返回值 只在aborted时生效
                    const tempReturnValue: TempHookResultWrapper<boolean> = { current: true };
                    if (!hookItems || hookItems.option.length == 0) {
                        //没有hook
                        return this.originObjectReference.Reflect.set(target, p, newValue, receiver);
                    }
                    const abortController = new this.originObjectReference.AbortController();
                    for (const hookOption of hookItems.option) {
                        hookOption.beforeSet?.(p, newValue, abortController, tempNewValue, tempReturnValue)
                    }
                    if (abortController.signal.aborted) {
                        return tempReturnValue.current
                    }
                    return this.originObjectReference.Reflect.set(target, p, tempNewValue.current, receiver);
                },
                deleteProperty: (target, p) => {
                    const hookItems = this.getHookItem("object", parent, objectName);
                    if (!hookItems || hookItems.option.length == 0) {
                        //没有hook
                        return this.originObjectReference.Reflect.deleteProperty(target, p);
                    }
                    const allowDelete = new this.originObjectReference.AbortController();
                    const tempResult: TempHookResultWrapper<boolean> = { current: true };
                    for (const hookOption of hookItems.option) {
                        hookOption.beforeDelete?.(p, allowDelete, tempResult);
                    }
                    if (allowDelete.signal.aborted) {
                        return tempResult.current
                    }
                    tempResult.current = this.originObjectReference.Reflect.deleteProperty(target, p);
                    return tempResult.current;
                },
                defineProperty: (target, property, attributes) => {
                    const hookItem = this.getHookItem("object", parent, objectName);
                    if (!hookItem || hookItem.option.length === 0) {
                        return this.originObjectReference.Reflect.defineProperty(target, property, attributes);
                    }
                    const abortController = new this.originObjectReference.AbortController();
                    const tempResult: TempHookResultWrapper<boolean> = { current: true };
                    for (const option of hookItem.option) {
                        option.beforeDefineProperty?.(property, attributes, abortController, tempResult);
                    }
                    if (abortController.signal.aborted) {
                        return tempResult.current;
                    }
                    return this.originObjectReference.Reflect.defineProperty(target, property, attributes);
                },
            });
            const originDescriptor = this.originObjectReference.Reflect.getOwnPropertyDescriptor(parent, objectName) ?? {
                configurable: true,
                writable: true,
                enumerable: true,
            };
            const hookDefineResult = this.originObjectReference.Reflect.defineProperty(parent, objectName, {
                value: hookProxy,
                writable: hookOption.descriptor?.writable ?? originDescriptor.writable ?? true,
                enumerable: hookOption.descriptor?.enumerable ?? originDescriptor.enumerable ?? true,
                configurable: hookOption.descriptor?.configurable ?? originDescriptor.configurable ?? true,
            });
            if (hookDefineResult) {
                const hookItem: ObjectHookMapItem = {
                    originParent: parent,
                    originObject: originObject as AnyConstructorType,
                    objectName,
                    option: [hookOption]
                }
                this.setHookItem("object", parent, objectName, hookItem);
                return true;
            }
            return false
        } catch (error) {
            this.originObjectReference.console.warn("Error on hooking object:", error);
            return false;
        }
    }
    unhook(type: HookType, parent: object, name: string, id: string) {
        const targetMap = (() => {
            switch (type) {
                case "method":
                    return this.hookedMethodMap
                case "accessor":
                    return this.hookedAccessorMap
                case "object":
                    return this.hookedObjectMap
                default:
                    return null
            }
        })();
        if (!targetMap) return;
        const parentHookList = this.originObjectReference.Reflect.apply(this.originObjectReference.WeakMap.get,targetMap,[parent])
        if (!parentHookList) return;
        const childHookList = this.originObjectReference.Reflect.apply(this.originObjectReference.Map.get,parentHookList,[name]);
        if (!childHookList) return;
        for (let i = childHookList.option.length - 1; i >= 0; i--) {
            if (childHookList.option[i]?.id === id) {
                this.originObjectReference.Reflect.apply(this.originObjectReference.Array.splice,childHookList.option,[i,1])
                break
            }
        }
        if (childHookList.option.length === 0) this.originObjectReference.Reflect.apply(this.originObjectReference.Map.delete,parentHookList,[name])
    }
    private getOriginExecutable(target: Function | object) {
        return this.originObjectReference.Reflect.get(target, this.GET_ORIGIN_METHOD_SYMBOL) ?? null;
    }
    public ensureOriginExecutable<T>(target: Function | object): T {
        return this.originObjectReference.Reflect.get(target, this.GET_ORIGIN_METHOD_SYMBOL) ?? target;
    }
    private getHookItem(type: "method", parent: object, name: string): MethodHookMapItem | null
    private getHookItem(type: "object", parent: object, name: string): ObjectHookMapItem | null
    private getHookItem(type: "accessor", parent: object, name: string): AccessorHookMapItem | null
    private getHookItem(type: HookType, parent: object, name: string): any {
        const rootMap = (() => {
            switch (type) {
                case "method":
                    return this.hookedMethodMap;
                case "accessor":
                    return this.hookedAccessorMap;
                case "object":
                    return this.hookedObjectMap;
                default:
                    throw new this.originObjectReference.TypeError(`Invalid hook type: ${type}`);
            }
        })();
        const rootMapResult = this.originObjectReference.Reflect.apply(this.originObjectReference.WeakMap.get,rootMap,[parent])
        return rootMapResult ? this.originObjectReference.Reflect.apply(this.originObjectReference.Map.get,rootMapResult,[name]) ?? null : null
    }
    private setHookItem(type: "method", parent: object, name: string, item: MethodHookMapItem): void
    private setHookItem(type: "object", parent: object, name: string, item: ObjectHookMapItem): void
    private setHookItem(type: "accessor", parent: object, name: string, item: AccessorHookMapItem): void
    private setHookItem(type: HookType, parent: object, name: string, item: any) {
        const rootMap = (() => {
            switch (type) {
                case "method":
                    return this.hookedMethodMap;
                case "accessor":
                    return this.hookedAccessorMap;
                case "object":
                    return this.hookedObjectMap;
                default:
                    throw new this.originObjectReference.TypeError(`Invalid hook type: ${type}`);
            }
        })();
        let parentMap = this.originObjectReference.Reflect.apply(this.originObjectReference.WeakMap.get,rootMap,[parent])
        if (!parentMap) {
            parentMap = new this.originObjectReference.MapObject();
            this.originObjectReference.Reflect.apply(this.originObjectReference.WeakMap.set,rootMap,[parent,parentMap as any])
        }
        this.originObjectReference.Reflect.apply(this.originObjectReference.Map.set,parentMap,[name,item])

    }
    isHooked(method: any) {
        if (!method) return false;
        return this.originObjectReference.Reflect.has(method, this.HOOKED_SYMBOL);
    }
}