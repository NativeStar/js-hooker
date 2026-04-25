import { OriginObjects } from "./originObjects";

export class StaticMethods{
    constructor(_option:any){}
    static getOriginReference(){
        return OriginObjects;
    }
}