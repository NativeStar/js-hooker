import type { OriginObjects } from "./originObjects.js";

export type HookType = "method" | "accessor" | "object"
export type AnyFunctionType = (...args: any[]) => any;
export type AnyConstructorType = abstract new (...args: any[]) => any;
export interface TempHookResultWrapper<T> {
    current: T;
}
export type MethodByName<P extends object, K extends string> = K extends keyof P ? Extract<P[K], AnyFunctionType> : AnyFunctionType;
export type ConstructorPropertyName<P extends object> = Extract<{
    [K in keyof P]-?: P[K] extends AnyConstructorType ? K : never
}[keyof P], string>;
export interface HookerConstruct {
    /**
     * 设置原始引用 如果同时存在多个hooker实例则建议设置该属性避免可能的死循环
     * 
     * 属性值可通过调用静态方法Hooker.getOriginReference获取
     */
    originReference?: typeof OriginObjects
    /**
     * 控制是否默认启用hook检测绕过
     */
    enableBypassDefault?: boolean
    /**
     * 设置hook标记用内部symbol 如果同时存在多个hooker实例则建议均使用一个symbol减少可能的异常
     */
    internalTagSymbol?: symbol
}
export interface MethodHookOption<F extends AnyFunctionType, R = ReturnType<F>> {
    /**
     * hook时是否执行检测绕过 该项优先级高于enableBypassDefault
     * 
     * 如果hook的方法非原生方法(原生方法如console.log alert) 请勿开启绕过
     */
    enableBypass?: boolean
    /**
     * 设置hook代理时使用的描述符 仅在对方法首次hook时生效
     */
    descriptor?: Omit<PropertyDescriptor, "set" | "get" | "value">;
    /**
     * 唯一标识 如无需unhook或检查hook状态可忽略
     */
    id?: string
    /**在方法执行前触发
     * @param args 方法执行时传入的参数 可以进行修改
     * @param abortController 中断执行控制器 调用abort将中断方法执行
     * @param thisArg 方法执行时的this指向
     * @param tempMethodResult 可修改的临时返回值 注意这里的返回值设置仅在中断执行时生效
     * @param originMethod 原始方法 可调用(部分方法执行时注意this指向)
     */
    beforeMethodInvoke?: (args: Parameters<F>, abortController: AbortController, thisArg: ThisParameterType<F>, tempMethodResult: TempHookResultWrapper<R>, originMethod: F) => void;
    /**在方法执行后触发
     * @param args 方法执行时传入的参数 此时修改参数已基本无意义
     * @param tempMethodResult 可修改的预期返回值
     * @param thisArg 方法执行时的this指向
     * @param originMethod 原始方法 可调用(部分方法执行时注意this指向)
     */
    afterMethodInvoke?: (args: Parameters<F>, tempMethodResult: TempHookResultWrapper<R>, thisArg: ThisParameterType<F>, originMethod: F) => void;
    /**
     * 当方法执行发生异常时触发
     * @param args 方法执行时传入的参数 此时修改参数已基本无意义
     * @param throwAbortController 中断异常抛出控制器 调用abort将中断异常抛出并正常返回tempResult中的值
     * @param tempError 抛出的异常实例 可修改并影响最终抛出内容
     * @param tempResult 可修改的临时返回值 将在中断抛出后正常返回
     * @param thisArg 方法执行时的this指向
     * @param originMethod 原始方法 可调用(部分方法执行时注意this指向)
     */
    onInvokingError?: (args: Parameters<F>, throwAbortController: AbortController, tempError: TempHookResultWrapper<unknown>, tempResult:TempHookResultWrapper<R>,thisArg: ThisParameterType<F>, originMethod: F) => void
}
export interface AccessorHookOption<P extends object, K extends keyof P> {
    /**
     * hook时是否执行检测绕过 该项优先级高于enableBypassDefault
     * 
     * 如果hook的访问器非原生方法 请勿开启绕过
     */
    enableBypass?: boolean
    /**
     * 唯一标识 如无需unhook或检查hook状态可忽略
     */
    id?: string;
    /**
     * 设置hook代理时使用的描述符 仅在对访问器首次hook时生效
     */
    descriptor?: Omit<PropertyDescriptor, "set" | "get" | "value" | "writable">;
    /**
     * 在getter方法执行前触发
     * @param abortController 中断执行控制器 调用abort将中断方法执行
     * @param thisArg 方法执行时的this指向
     * @param tempMethodResult 可修改的临时返回值 注意这里的返回值设置仅在中断执行时生效
     */
    beforeGetterInvoke?: (abortController: AbortController, thisArg: P, tempMethodResult: TempHookResultWrapper<P[K]>) => void;
    /**
     * 在getter方法执行后触发
     * @param tempMethodResult 可修改的预期返回值
     * @param thisArg 方法执行时的this指向
     */
    afterGetterInvoke?: (tempMethodResult: TempHookResultWrapper<P[K]>, thisArg: P) => void;
    /**
     * 在setter方法执行前触发
     * @param arg 方法执行时传入的参数 可以进行修改
     * @param abortController 中断执行控制器 调用abort将中断方法执行
     * @param thisArg 方法执行时的this指向
     */
    beforeSetterInvoke?: (arg: P[K], abortController: AbortController, thisArg: P) => void;
}
export interface MethodHookMapItem {
    originMethod: AnyFunctionType;
    originParent: object;
    methodName: string
    originDescriptor: TypedPropertyDescriptor<any>
    option: MethodHookOption<AnyFunctionType>[];
}
export interface AccessorHookMapItem<T = any> {
    originGetter: (() => T) | null;
    originSetter: ((value: T) => void) | null;
    originDescriptor: TypedPropertyDescriptor<any>
    option: AccessorHookOption<any, any>[];
}
export interface ObjectHookOption<C extends AnyConstructorType = AnyConstructorType> {
    /**
     * 唯一标识 如无需unhook或检查hook状态可忽略
     */
    id?: string
    /**
     * hook时是否执行检测绕过 该项优先级高于enableBypassDefault
     * 
     * 如果hook的对象非原生对象 请勿开启绕过
     */
    enableBypass?: boolean
    /**
     * 设置hook代理时使用的描述符 仅在对该对象首次hook时生效
     */
    descriptor?: Omit<PropertyDescriptor, "set" | "get" | "value">;
    /**
     * 尝试获取对象内属性时触发
     * @param prop 获取的参数名称
     * @param tempResult 可供修改的预期返回值
     */
    afterGet?: (prop: string | symbol, tempResult: TempHookResultWrapper<any>) => void
    /**
     * 通过Reflect.has或in操作符检测是否含有指定属性时触发
     * @param prop 检测的参数名称
     * @param tempResult 可供修改的返回值
     */
    afterHas?: (prop: string | symbol, tempResult: TempHookResultWrapper<boolean>) => void
    /**
     * 通过new操作符等方式创建新实例前触发
     * @param args 对构造方法传入的参数 可以进行修改
     * @param abortController 中断执行控制器 调用abort将中断创建实例 注意中断后必须设置返回值否则会崩溃
     * @param tempObject 临时缓存的新实例返回 可用于修改返回值 注意这里修改的返回值仅在中断执行时生效
     * @param originConstruct 原始构造方法 可实例化
     */
    beforeConstruct?: (args: ConstructorParameters<C>, abortController: AbortController, tempObject: TempHookResultWrapper<InstanceType<C>>, originConstruct: C) => void
    /**
     * 通过new操作符等方式创建新实例后触发
     * @param args 对构造方法传入的参数 此时修改参数已基本无意义
     * @param tempObject 可供修改的返回值 需为一个对象
     * @param originConstruct 原始构造方法 可实例化
     */
    afterConstruct?: (args: any[], tempObject: TempHookResultWrapper<any>, originConstruct: C) => void
    /**
     * 往对象内设置属性时触发
     * @param prop 属性名
     * @param value 调用时传入要设定的属性值
     * @param abortController 中断执行控制器 调用abort将中断属性设置
     * @param tempNewValue 可供修改的新属性值
     * @param tempReturnValue 可供修改的返回值 用于Reflect.set等的返回
     */
    beforeSet?: (prop: string | symbol, value: any, abortController: AbortController, tempNewValue: TempHookResultWrapper<any>, tempReturnValue: TempHookResultWrapper<boolean>) => void
    /**
     * 尝试删除对象内属性时触发
     * @param prop 要删除的属性
     * @param deleteController 中断执行控制器 调用abort将中断属性删除
     * @param tempReturn 可供修改的返回值 用于Reflect.delete等的返回
     */
    beforeDelete?: (prop: string | symbol, deleteController: AbortController, tempReturn: TempHookResultWrapper<boolean>) => void
    /**
     * 通过defineProperty类方法定义对象内属性时触发
     * @param prop 属性名
     * @param descriptor 传入的属性描述符
     * @param abortController 中断执行控制器 调用abort将中断设置属性
     * @param tempResult 可修改的临时返回值 注意这里的返回值设置仅在中断执行时生效
     */
    beforeDefineProperty?: (prop: string | symbol, descriptor: PropertyDescriptor, abortController: AbortController, tempResult: TempHookResultWrapper<boolean>) => void
}
export interface ObjectHookMapItem<C extends AnyConstructorType = AnyConstructorType> {
    originObject: C;
    originParent: object;
    objectName: string
    option: ObjectHookOption<C>[];
    originDescriptor: TypedPropertyDescriptor<any>
}