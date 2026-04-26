import { OriginObjects } from "./originObjects.js";

export class StaticMethods{
    constructor(_option:any){}
    static getOriginReference(){
        return OriginObjects;
    }
}