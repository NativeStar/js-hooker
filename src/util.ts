import {type OriginObjects } from "./originObjects.js";
const leakedStackFeature = [
    "at Object.apply (<anonymous>:",
    "hookEntry (<anonymous>:",
    "at bypassToStringMethod.toString (<anonymous>:",
    "on proxy:",
    "Proxy.",
    "proxy",
    "at new Promise (<anonymous>)",
    "at <anonymous>:",
    "at Object.construct (<anonymous>:",
    "chrome-extension://",
    "at Object.before",
    "at Object.after",
    "beforeConstruct",
    "afterConstruct"
]
export function needDeleteStack(originRef:typeof OriginObjects,stack: string): boolean {
    for (const leakStr of leakedStackFeature) {
        if (originRef.Reflect.apply(originRef.String.includes, stack, [leakStr])) {
            return false;
        }
    }
    return true;
}
export function filterErrorStack(originRef:typeof OriginObjects,stack: string) {
    const splitStack = originRef.Reflect.apply(originRef.String.split, stack, ["\n"]);
    const filteredStack = originRef.Reflect.apply(originRef.Array.filter, splitStack, [line => needDeleteStack(originRef, line)]);
    return originRef.Reflect.apply(originRef.Array.join, filteredStack, ["\n"]);
}
export function createBypassToStringMethod(originRef:typeof OriginObjects,methodName: string,targetType:"normal"|"get"|"set"="normal"): () => string {
    const toString = function (this: any) {
        if (!(this instanceof Function)) {
            const error = new originRef.TypeError("Function.prototype.toString requires that 'this' be a Function");
            error.stack = filterErrorStack(originRef,(error.stack) as string);
            throw error;
        }
        return `function ${targetType==="normal"?"":`${targetType} `}${methodName}() { [native code] }`;
    }
    originRef.Reflect.defineProperty(toString,"name",{value: "toString"})
    toString.toString = getFakeNativeToString(originRef);
    toString.toString.toString = getFakeNativeToString(originRef);
    toString.prototype = void 0;
    toString.toString.prototype = void 0;
    return toString;
}
function getFakeNativeToString(originRef:typeof OriginObjects) {
    const toString = function (this: any) {
        if (!(this instanceof Function)) {
            const error = new originRef.TypeError("Function.prototype.toString requires that 'this' be a Function");
            error.stack = filterErrorStack(originRef,(error.stack) as string);
            throw error;
        }
        return "function toString() { [native code] }"
    };
    originRef.Reflect.defineProperty(toString,"name",{value: "toString"})
    toString.toString = toString;
    toString.prototype = void 0;
    return toString;
}