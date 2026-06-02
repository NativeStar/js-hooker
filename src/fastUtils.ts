import type { Hooker } from "./hooker";

export class FastUtils {
    static hookAbortMethodExecute<P extends object, K extends keyof P>(hooker: Hooker, parent: P, target: K, methodType: "async" | "sync", onExecuteCallback?: () => void, defaultReturnValue?: any): boolean;
    static hookAbortMethodExecute<P extends object, K extends string>(hooker: Hooker, parent: P, target: K, methodType: "async" | "sync", onExecuteCallback?: () => void, defaultReturnValue?: any): boolean;
    static hookAbortMethodExecute(hooker: Hooker, parent: any, methodName: string, methodType: "async" | "sync", onExecuteCallback?: () => void, defaultReturnValue?: any) {
        return methodType === "sync" ? hooker.hookMethod(parent, methodName, {
            beforeMethodInvoke(_args, abortController, _thisArg, tempMethodResult) {
                abortController.abort();
                if (defaultReturnValue) {
                    tempMethodResult.current = defaultReturnValue;
                }
                onExecuteCallback?.();
            }
        }) : hooker.hookAsyncMethod(parent, methodName, {
            beforeMethodInvoke(_args, abortController, _thisArg, tempMethodResult) {
                abortController.abort();
                if (defaultReturnValue) {
                    tempMethodResult.current = defaultReturnValue;
                }
                onExecuteCallback?.();
            }
        });
    }
    static hookInterruptMethodExecute<P extends object, K extends keyof P>(hooker: Hooker, parent: P, target: K, methodType: "async" | "sync", interruptType: "before" | "after" | "all"): boolean;
    static hookInterruptMethodExecute<P extends object, K extends string>(hooker: Hooker, parent: P, target: K, methodType: "async" | "sync", interruptType: "before" | "after" | "all"): boolean;
    static hookInterruptMethodExecute(hooker: Hooker, parent: any, methodName: string, methodType: "async" | "sync", interruptType: "before" | "after" | "all") {
        return methodType === "sync" ? hooker.hookMethod(parent, methodName, {
            beforeMethodInvoke() {
                if (interruptType !== "after") debugger
            },
            afterMethodInvoke() {
                if (interruptType !== "before") debugger
            }
        }) : hooker.hookAsyncMethod(parent, methodName, {
            beforeMethodInvoke() {
                if (interruptType !== "after") debugger
            },
            afterMethodInvoke() {
                if (interruptType !== "before") debugger
            }
        })
    }
    static hookPrintMethodExecuteArgs<P extends object, K extends keyof P>(hooker: Hooker, parent: P, target: K, methodType: "async" | "sync"): boolean;
    static hookPrintMethodExecuteArgs<P extends object, K extends string>(hooker: Hooker, parent: P, target: K, methodType: "async" | "sync"): boolean;
    static hookPrintMethodExecuteArgs(hooker: Hooker, parent: any, methodName: string, methodType: "async" | "sync") {
        return methodType === "sync" ? hooker.hookMethod(parent, methodName, {
            beforeMethodInvoke(args) {
                hooker.ensureOriginExecutable<typeof console.log>(console.log)(args)
            }
        }) : hooker.hookAsyncMethod(parent, methodName, {
            beforeMethodInvoke(args) {
                hooker.ensureOriginExecutable<typeof console.log>(console.log)(args)
            }
        })
    }
}