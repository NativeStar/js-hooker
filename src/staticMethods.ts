import { OriginObjects } from "./originObjects.js";

export class StaticMethods{
    constructor(_option:any){}
    /**
     * 获取原始对象引用
     * 
     * 注意:建议尽早调用 否则方法引用可能被污染
     */
    static getOriginReference(){
        return OriginObjects;
    }
}