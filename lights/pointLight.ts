import {vec4} from "../helpers/helperfunctions.js";

export class Light {

    position:vec4;
    color:vec4;
    direction:vec4;
    radiusAngle:number;
    constructor() {
        this.position = new vec4(3, 3, 3, 1);
        this.color = new vec4(1, 1, 1, 1);
        this.direction = new vec4(1, 1, 1, 0);
        this.radiusAngle = 20;
    }

    getLightData():number[] {
        let retList:number[] = [];
        retList.push(...this.position.flatten()); //0-3
        retList.push(...this.color.flatten()); //4-7
        retList.push(...this.direction.flatten()); // 8-11
        retList.push(this.radiusAngle); // 12
        return retList;
    }
}