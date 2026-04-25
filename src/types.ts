export type HookType="method"|"accessor"|"object"
export type AnyFunctionType = (...args: any[]) => any;
export type AnyConstructorType = abstract new (...args: any[]) => any;
export interface TempHookResultWrapper<T> {
    current: T;
}
export type MethodByName<P extends object, K extends string> = K extends keyof P ? Extract<P[K], AnyFunctionType> : AnyFunctionType;
export type ConstructorPropertyName<P extends object> = Extract<{
    [K in keyof P]-?: P[K] extends AnyConstructorType ? K : never
}[keyof P], string>;
export interface MethodHookOption<F extends AnyFunctionType, R = ReturnType<F>> {
    descriptor?: Omit<PropertyDescriptor, "set" | "get" | "value">;
    /**
     * 唯一标识 用于unhook
     */
    id?: string
    /**
     * @param args 方法参数
     * @param abortController 中断执行控制器
     * @param thisArg this指向
     * @param tempMethodResult 可修改返回值 注意这里的返回值设置仅在中断执行时生效 
     */
    beforeMethodInvoke?: (args: Parameters<F>, abortController: AbortController, thisArg: ThisParameterType<F>, tempMethodResult: TempHookResultWrapper<R>, originMethod: F) => void;
    /**
     * @param args 方法参数
     * @param tempMethodResult 可修改返回值
     * @param thisArg this指向
     */
    afterMethodInvoke?: (args: Parameters<F>, tempMethodResult: TempHookResultWrapper<R>, thisArg: ThisParameterType<F>,originMethod:F) => void;
}
export interface AccessorHookOption<P extends object, K extends keyof P> {
    id?: string;
    descriptor?: Omit<PropertyDescriptor, "set" | "get" | "value" | "writable">;
    beforeGetterInvoke?: (abortController: AbortController, thisArg: P, tempMethodResult: TempHookResultWrapper<P[K]>) => void;
    afterGetterInvoke?: (tempMethodResult: TempHookResultWrapper<P[K]>, thisArg: P) => void;
    beforeSetterInvoke?: (arg: P[K], abortController: AbortController, thisArg: P) => void;
}
export interface MethodHookMapItem {
    originMethod: AnyFunctionType;
    originParent: object;
    methodName: string
    option: MethodHookOption<AnyFunctionType>[];
}
export interface AccessorHookMapItem<T = any> {
    originGetter: (() => T) | null;
    originSetter: ((value: T) => void) | null;
    option: AccessorHookOption<any, any>[];
}
export interface ObjectHookOption<C extends AnyConstructorType = AnyConstructorType> {
    id?: string
    descriptor?: Omit<PropertyDescriptor, "set" | "get" | "value">;
    afterGet?: (prop: string | symbol, tempResult: TempHookResultWrapper<any>) => void
    afterHas?: (prop: string | symbol, tempResult: TempHookResultWrapper<boolean>) => void
    beforeConstruct?: (args: ConstructorParameters<C>, abortController: AbortController, tempObject: TempHookResultWrapper<InstanceType<C>>,originConstruct:C) => void
    afterConstruct?: (args: any[], tempObject: TempHookResultWrapper<any>,originConstruct:C) => void
    beforeSet?: (prop: string | symbol, value: any, abortController: AbortController, tempNewValue: TempHookResultWrapper<any>, tempReturnValue: TempHookResultWrapper<boolean>) => void
    beforeDelete?: (prop: string | symbol, deleteController: AbortController,tempReturn:TempHookResultWrapper<boolean>) => void
    beforeDefineProperty?: (prop: string | symbol, descriptor: PropertyDescriptor, abortController: AbortController, tempResult: TempHookResultWrapper<boolean>) => void
}
export interface ObjectHookMapItem<C extends AnyConstructorType=AnyConstructorType> {
    originObject: C;
    originParent: object;
    objectName: string
    option: ObjectHookOption<C>[];
}