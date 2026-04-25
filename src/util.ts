import { OriginObjects } from "./originObjects";
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
export function needDeleteStack(stack: string): boolean {
    for (const leakStr of leakedStackFeature) {
        if (OriginObjects.String.includes.call(stack, leakStr)) {
            return false;
        }
    }
    return true;
}
export function filterErrorStack(stack: string) {
    const splitStack = stack.split("\n");
    const filteredStack = splitStack.filter(line => needDeleteStack(line))
    return filteredStack.join("\n");
}
export function createBypassToStringMethod(methodName: string,targetType:"normal"|"get"|"set"="normal"): () => string {
    const toString = function (this: any) {
        if (!(this instanceof Function)) {
            const error = new TypeError("Function.prototype.toString requires that 'this' be a Function");
            error.stack = filterErrorStack((error.stack) as string);
            throw error;
        }
        return `function ${targetType==="normal"?"":`${targetType} `}${methodName}() { [native code] }`;
    }
    OriginObjects.Reflect.defineProperty(toString,"name",{value: "toString"})
    toString.toString = getFakeNativeToString();
    toString.toString.toString = getFakeNativeToString();
    toString.prototype = void 0;
    toString.toString.prototype = void 0;
    return toString;
}
function getFakeNativeToString() {
    const toString = function (this: any) {
        if (!(this instanceof Function)) {
            const error = new OriginObjects.TypeError("Function.prototype.toString requires that 'this' be a Function");
            error.stack = filterErrorStack((error.stack) as string);
            throw error;
        }
        return "function toString() { [native code] }"
    };
    OriginObjects.Reflect.defineProperty(toString,"name",{value: "toString"})
    toString.toString = toString;
    toString.prototype = void 0;
    return toString;
}