# js-hooker
[English](./README.md)
|
[简体中文](./README_zh.md)

一个轻量、简洁的 适用于浏览器环境的JavaScript Hook库

[Github](https://github.com/NativeStar/js-hooker)

[NPM](https://www.npmjs.com/package/js-hooker)
### 简介
支持对函数、访问器、构造函数进行hook 并实现阻止执行、修改执行参数、修改返回值等功能

适用于网页脚本(如TamperMonkey脚本 浏览器扩展ContentScript)开发 需要对函数功能进行修改的情况

使用方法可参考项目https://github.com/NativeStar/Kyouka

### 使用方法
安装
```
npm i js-hooker
```
导入并创建实例
```ts
import {Hooker} from "js-hooker"
const hooker=new Hooker();
```
### 使用示例
```ts
//阻止alert弹窗
hooker.hookMethod(window,"alert",{
    beforeMethodInvoke(args, abortController) {
        abortController.abort();
    }
});
// 打印fetch请求数据
hooker.hookAsyncMethod(window,"fetch",{
    beforeMethodInvoke(args, abortController) {
        console.log(args)
    }
});
//阻止设置script元素的src属性
hooker.hookAccessor(HTMLScriptElement.prototype, "src", {
    beforeSetterInvoke(arg, abortController) {
        abortController.abort();
    },
});
//拦截new Function操作并替换为执行空代码
hooker.hookObject(window,"Function",{
    beforeConstruct(_args, abortController, tempObject, originConstruct) {
        abortController.abort();
        tempObject.current = originConstruct("");
    },
});
```
### 文档
#### 构造函数
originReference:设置默认方法引用 仅建议在需要多个Hooker实例时使用

enableBypassDefault:是否默认启用绕过hook检测

internalTagSymbol:设置用于判断方法hook的内部symbol 仅建议在需要多个Hooker实例时使用
#### Hooker.getOriginReference() (静态方法)
获取目前的原始方法引用快照 用于创建新Hooker实例时使用 亦可留作脚本自用
#### hookMethod(parent, methodName, hookOption)
对指定的同步方法执行hook

parent:目标方法所在的的父对象

methodName:目标方法名

hookOption:执行hook的设置:

- enableBypass?:hook时是否执行检测绕过 该项优先级高于enableBypassDefault
- descriptor?:设置hook代理时使用的描述符 仅在对方法首次hook时生效
- id?:唯一标识 如无需unhook或检查hook状态可忽略
- beforeMethodInvoke?:在方法调用前触发的回调:(arg, abortController, thisArg, tempMethodResult, originMethod)

args:方法执行时传入的参数 可以进行修改

abortController:中断执行控制器 调用abort将中断方法执行

thisArg:方法执行时的this指向

tempMethodResult:可修改的临时返回值 注意这里的返回值设置仅在中断执行时生效

originMethod 原始方法 可调用(部分方法执行时注意this指向)
- afterMethodInvoke?:在方法调用后触发的回调:(args, tempMethodResult, thisArg, originMethod)

args:方法执行时传入的参数 此时修改参数已基本无意义

tempMethodResult:可修改的预期返回值

thisArg:方法执行时的this指向

originMethod:原始方法 可调用(部分方法执行时注意this指向)
#### hookAsyncMethod(parent, methodName, hookOption)
对指定的异步方法执行hook 使用方法和hookMethod方法一致
#### hookAccessor(parent, target, hookOption)
对指定的访问器执行hook

parent:目标访问器所在的的父对象

methodName:目标访问器名

hookOption:执行hook的设置:
- enableBypass?:hook时是否执行检测绕过 该项优先级高于enableBypassDefault
- descriptor?:设置hook代理时使用的描述符 仅在对方法首次hook时生效
- id?:唯一标识 如无需unhook或检查hook状态可忽略
- beforeGetterInvoke:在getter方法执行前触发:(abortController, thisArg, tempMethodResult)

abortController:中断执行控制器 调用abort将中断方法执行

thisArg:方法执行时的this指向

tempMethodResult:可修改的临时返回值 注意这里的返回值设置仅在中断执行时生效
- afterGetterInvoke:(tempMethodResult, thisArg)

tempMethodResult:可修改的预期返回值

thisArg:方法执行时的this指向
- beforeSetterInvoke:(arg, abortController, thisArg)

arg:方法执行时传入的参数 可以进行修改

abortController:中断执行控制器 调用abort将中断方法执行

thisArg:方法执行时的this指向
#### hookObject(parent,objectName,hookOption)
对指定的可实例化对象执行hook

parent:目标对象所在的的父对象

methodName:目标对象名

hookOption:执行hook的设置:
- enableBypass?:hook时是否执行检测绕过 该项优先级高于enableBypassDefault
- descriptor?:设置hook代理时使用的描述符 仅在对方法首次hook时生效
- id?:唯一标识 如无需unhook或检查hook状态可忽略
- afterGet:尝试获取对象内属性时触发:(prop, tempResult)

prop:获取的参数名称

tempResult:可供修改的预期返回值
- afterHas:通过Reflect.has或in操作符检测是否含有指定属性时触发:(prop,tempResult)

prop:获取的参数名称

tempResult:可供修改的预期返回值
- beforeConstruct:通过new操作符等方式创建新实例前触发:(args, abortController, tempObject,originConstruct)

args:对构造方法传入的参数 可以进行修改

abortController:中断执行控制器 调用abort将中断创建实例

tempObject:临时缓存的新实例返回 可用于修改返回值 注意这里修改的返回值仅在中断执行时生效

originConstruct:原始构造方法 可实例化
- afterConstruct:通过new操作符等方式创建新实例后触发:(args,tempObject,originConstruct)

args:对构造方法传入的参数 此时修改参数已基本无意义

tempObject:可供修改的返回值 需为一个对象

originConstruct:原始构造方法 可实例化
- beforeSet:往对象内设置属性时触发:(prop, value, abortController, tempNewValue, tempReturnValue)

prop:属性名

value:调用时传入要设定的属性值

abortController:中断执行控制器 调用abort将中断属性设置

tempNewValue:可供修改的新属性值

tempReturnValue:可供修改的返回值 用于Reflect.set等的返回

- beforeDelete:尝试删除对象内属性时触发:(prop, deleteController, tempReturn)

prop:要删除的属性

deleteController:中断执行控制器 调用abort将中断属性删除

tempReturn:可供修改的返回值 用于Reflect.delete等的返回
- beforeDefineProperty:通过defineProperty类方法定义对象内属性时触发:(prop, descriptor, abortController, tempResult)

prop:属性名

descriptor:传入的属性描述符

abortController:中断执行控制器 调用abort将中断设置属性

tempResult:可修改的临时返回值 注意这里的返回值设置仅在中断执行时生效
#### unhook(type, parent, name, id,autoRestore)
取消指定id的hook

type:准备取消hook属性的类型

parent:准备取消hook属性的父对象

name:准备取消hook属性的名称

id:准备取消的hook id

autoRestore:当目标方法已无挂载hook时是否自动还原原始属性
#### restoreHook(type, parent, targetName)
还原指定方法为原始方法并移除所有hook

type:准备还原属性的类型

parent:准备还原属性的父对象

targetName:准备还原属性的名称
#### ensureOriginExecutable(target)
传入被hook的对象并返回其原始对象 如果传入对象未被hook则将其原路返回

target:目标对象
#### isHooked(target)
判断传入的对象是否已经过hook

target:目标对象
#### isHookedById(type, parent, target, id)
检查指定id的hook是否已挂载到指定属性上

type:被hook属性的类型

parent:准备检查hook属性的父对象

target:准备检查hook属性的名称

id:目标hook id
### internalSymbol (实例属性)
返回实例内部用于标记hook方法的symbol 

### originReference(实例属性)
返回实例内部保存的部分方法引用 获取后可调用避免使用可能被页面污染的方法

### 注意事项
- 建议只创建一个Hooker实例 如果必须创建多个实例 应尽早通过Hooker.getOriginReference方法获取原始方法引用并在创建后来的Hooker实例时将其传入 避免使用到受污染的方法
```ts
const originRef=Hooker.getOriginReference();
const hooker1=new Hooker({originReference:originRef})
const hooker2=new Hooker({originReference:originRef})

```
- 如果使用多个Hooker实例 应避免两个或以上的实例同时hook同一个方法  否则会导致hook失效或其他异常
```ts
//不可多实例hook同一个方法!
//这是错误示例
const hooker1=new Hooker();
const hooker2=new Hooker();
hooker1.hookMethod(window,"alert",{});
hooker2.hookMethod(window,"alert",{});
```
- 作为用户脚本或浏览器扩展使用时建议尽早注入(document-start阶段)并创建实例 避免页面保存方法引用导致hook失效或页面修改了原生方法导致异常
- 该项目仅对Hook原生方法(alert open等)的行为进行测试 不保证在hook正常创建的方法时完全正常工作
- 如果需要hook非原生方法 建议对该方法关闭hook隐藏(hookOption对象内传入enableBypass:false)
- 由于eval函数的特殊性质 请谨慎对eval函数进行hook 否则某些网站会出现异常(拦截执行除外)