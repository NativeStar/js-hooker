# js-hooker
适用于浏览器环境的JavaScript Hook库

### 简介
支持对函数、访问器、构造函数进行hook 并实现阻止执行、修改执行参数、修改返回值等功能

适用于网页脚本(如TamperMonkey)开发 需要对函数功能进行修改的情况

使用方法可参考项目https://github.com/NativeStar/Kyouka

### 使用方法
安装
```
npm i js-hooker
```
导出并创建实例
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
})
```
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