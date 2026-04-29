# js-hooker
[English](./README.md)
|
[Simplified Chinese](./README_zh.md)

A lightweight and concise JavaScript hook library for browser environments.

[Github](https://github.com/NativeStar/js-hooker)

[NPM](https://www.npmjs.com/package/js-hooker)
### Introduction
Supports hooking functions, accessors, and constructors, with features such as preventing execution, modifying execution arguments, and modifying return values.

Suitable for web script development, such as TamperMonkey scripts and browser extension ContentScripts, when function behavior needs to be modified.

For usage examples, refer to https://github.com/NativeStar/Kyouka

### Usage
Install
```
npm i js-hooker
```
Import and create an instance
```ts
import {Hooker} from "js-hooker"
const hooker=new Hooker();
```
### Examples
```ts
// Prevent alert popups
hooker.hookMethod(window,"alert",{
    beforeMethodInvoke(args, abortController) {
        abortController.abort();
    }
});
// Print fetch request data
hooker.hookAsyncMethod(window,"fetch",{
    beforeMethodInvoke(args, abortController) {
        console.log(args)
    }
});
// Prevent setting the src property of script elements
hooker.hookAccessor(HTMLScriptElement.prototype, "src", {
    beforeSetterInvoke(arg, abortController) {
        abortController.abort();
    },
});
// Intercept new Function operations and replace them with empty code execution
hooker.hookObject(window,"Function",{
    beforeConstruct(_args, abortController, tempObject, originConstruct) {
        abortController.abort();
        tempObject.current = originConstruct("");
    },
});
```
### Documentation
#### Constructor
originReference: Sets the default method references. Only recommended when multiple Hooker instances are needed.

enableBypassDefault: Whether to enable hook detection bypass by default.

internalTagSymbol: Sets the internal symbol used to identify hooked methods. Only recommended when multiple Hooker instances are needed.
#### Hooker.getOriginReference() (static method)
Gets a snapshot of the current original method references. It can be used when creating new Hooker instances, or kept for your own script usage.
#### hookMethod(parent, methodName, hookOption)
Hooks the specified synchronous method.

parent: The parent object where the target method is located.

methodName: The target method name.

hookOption: Settings for the hook:

- enableBypass?: Whether to perform detection bypass when hooking. This option has higher priority than enableBypassDefault.
- descriptor?: The descriptor used when setting the hook proxy. Only takes effect when hooking the method for the first time.
- id?: Unique identifier. Can be omitted if unhooking or checking hook status is not needed.
- beforeMethodInvoke?: Callback triggered before the method is called: (arg, abortController, thisArg, tempMethodResult, originMethod)

args: Arguments passed to the method during execution. They can be modified.

abortController: Execution abort controller. Calling abort will abort method execution.

thisArg: The this value during method execution.

tempMethodResult: Modifiable temporary return value. Note that this return value setting only takes effect when execution is aborted.

originMethod: The original method. It can be called directly. For some methods, pay attention to the this binding.
- afterMethodInvoke?: Callback triggered after the method is called: (args, tempMethodResult, thisArg, originMethod)

args: Arguments passed to the method during execution. Modifying arguments at this point is usually meaningless.

tempMethodResult: Modifiable expected return value.

thisArg: The this value during method execution.

originMethod: The original method. It can be called directly. For some methods, pay attention to the this binding.
#### hookAsyncMethod(parent, methodName, hookOption)
Hooks the specified asynchronous method. Usage is the same as hookMethod.
#### hookAccessor(parent, target, hookOption)
Hooks the specified accessor.

parent: The parent object where the target accessor is located.

methodName: The target accessor name.

hookOption: Settings for the hook:
- enableBypass?: Whether to perform detection bypass when hooking. This option has higher priority than enableBypassDefault.
- descriptor?: The descriptor used when setting the hook proxy. Only takes effect when hooking the method for the first time.
- id?: Unique identifier. Can be omitted if unhooking or checking hook status is not needed.
- beforeGetterInvoke: Triggered before the getter method is executed: (abortController, thisArg, tempMethodResult)

abortController: Execution abort controller. Calling abort will abort method execution.

thisArg: The this value during method execution.

tempMethodResult: Modifiable temporary return value. Note that this return value setting only takes effect when execution is aborted.
- afterGetterInvoke: (tempMethodResult, thisArg)

tempMethodResult: Modifiable expected return value.

thisArg: The this value during method execution.
- beforeSetterInvoke: (arg, abortController, thisArg)

arg: Argument passed during method execution. It can be modified.

abortController: Execution abort controller. Calling abort will abort method execution.

thisArg: The this value during method execution.
#### hookObject(parent,objectName,hookOption)
Hooks the specified instantiable object.

parent: The parent object where the target object is located.

methodName: The target object name.

hookOption: Settings for the hook:
- enableBypass?: Whether to perform detection bypass when hooking. This option has higher priority than enableBypassDefault.
- descriptor?: The descriptor used when setting the hook proxy. Only takes effect when hooking the method for the first time.
- id?: Unique identifier. Can be omitted if unhooking or checking hook status is not needed.
- afterGet: Triggered when trying to get a property from the object: (prop, tempResult)

prop: The name of the retrieved property.

tempResult: Modifiable expected return value.
- afterHas: Triggered when checking whether a specified property exists through Reflect.has or the in operator: (prop,tempResult)

prop: The name of the retrieved property.

tempResult: Modifiable expected return value.
- beforeConstruct: Triggered before creating a new instance through the new operator or similar methods: (args, abortController, tempObject,originConstruct)

args: Arguments passed to the constructor. They can be modified.

abortController: Execution abort controller. Calling abort will abort instance creation.

tempObject: Temporary cache for the new instance return value. It can be used to modify the return value. Note that this modification only takes effect when execution is aborted.

originConstruct: The original constructor. It can be instantiated.
- afterConstruct: Triggered after creating a new instance through the new operator or similar methods: (args,tempObject,originConstruct)

args: Arguments passed to the constructor. Modifying arguments at this point is usually meaningless.

tempObject: Modifiable return value. It must be an object.

originConstruct: The original constructor. It can be instantiated.
- beforeSet: Triggered when setting a property on the object: (prop, value, abortController, tempNewValue, tempReturnValue)

prop: Property name.

value: The property value passed during the call.

abortController: Execution abort controller. Calling abort will abort property setting.

tempNewValue: Modifiable new property value.

tempReturnValue: Modifiable return value, used as the return value of Reflect.set and similar operations.

- beforeDelete: Triggered when trying to delete a property from the object: (prop, deleteController, tempReturn)

prop: The property to delete.

deleteController: Deletion abort controller. Calling abort will abort property deletion.

tempReturn: Modifiable return value, used as the return value of Reflect.delete and similar operations.
- beforeDefineProperty: Triggered when defining a property on the object through defineProperty-like methods: (prop, descriptor, abortController, tempResult)

prop: Property name.

descriptor: The property descriptor passed in.

abortController: Execution abort controller. Calling abort will abort property setting.

tempResult: Modifiable temporary return value. Note that this return value setting only takes effect when execution is aborted.
#### unhook(type, parent, name, id,autoRestore)
Removes the hook with the specified id.

type: The type of the property to unhook.

parent: The parent object of the property to unhook.

name: The name of the property to unhook.

id: The hook id to remove.

autoRestore: Whether to automatically restore the original property when no hooks remain on the target method.
#### restoreHook(type, parent, targetName)
Restores the specified method to the original method and removes all hooks.

type: The type of the property to restore.

parent: The parent object of the property to restore.

targetName: The name of the property to restore.
#### ensureOriginExecutable(target)
Passes in a hooked object and returns its original object. If the passed object is not hooked, it is returned as is.

target: Target object.
#### isHooked(target)
Checks whether the passed object has been hooked.

target: Target object.
#### isHookedById(type, parent, target, id)
Checks whether the hook with the specified id is mounted on the specified property.

type: The type of the hooked property.

parent: The parent object of the property to check.

target: The name of the property to check.

id: Target hook id.
### internalSymbol (instance property)
Returns the symbol used internally by the instance to mark hooked methods.

### originReference(instance property)
Returns some method references stored internally by the instance. These can be called to avoid using methods that may have been polluted by the page.

### Notes
- It is recommended to create only one Hooker instance. If multiple instances must be created, use Hooker.getOriginReference as early as possible to obtain the original method references and pass them when creating later Hooker instances, to avoid using polluted methods.
```ts
const originRef=Hooker.getOriginReference();
const hooker1=new Hooker({originReference:originRef})
const hooker2=new Hooker({originReference:originRef})

```
- If using multiple Hooker instances, avoid having two or more instances hook the same method at the same time. Otherwise, hooks may fail or other exceptions may occur.
```ts
// Do not hook the same method with multiple instances!
// This is an incorrect example
const hooker1=new Hooker();
const hooker2=new Hooker();
hooker1.hookMethod(window,"alert",{});
hooker2.hookMethod(window,"alert",{});
```
- When used as a userscript or browser extension, it is recommended to inject it as early as possible, at the document-start stage, and create the instance early. This avoids hook failure caused by the page saving method references, or exceptions caused by the page modifying native methods.
- This project only tests the behavior of hooking native methods such as alert and open. It does not guarantee fully correct behavior when hooking normally created methods.
- If you need to hook non-native methods, it is recommended to disable hook hiding for that method by passing enableBypass:false in the hookOption object.
- Due to the special nature of the eval function, hook the eval function with caution. Otherwise, some websites may behave abnormally, except when only intercepting execution.
