import {mat4, rotateY, vec4} from "./helperfunctions.js";
import {RenderObject} from "./renderObject.js";

export abstract class Light {
    color:vec4;
    radiusAngle:number;
    object:RenderObject;
    position:vec4;
    direction:vec4;

    rotation:number;

    isOn:boolean;

    protected constructor(object:RenderObject, color:vec4, radiusAngle:number, position:vec4, direction:vec4) {
        this.object = object;
        this.color = color;
        this.radiusAngle = radiusAngle;
        this.position = position;
        this.direction = direction;

        this.isOn = false;
        this.rotation = 0;
    }

    getLightData(modelView:mat4):number[] {
        let transforms = this.object.getTransformsSequence();
        let mv = modelView;
        transforms.forEach((transformation) => {
            mv = mv.mult(transformation);
        });
        mv = mv.mult(rotateY(this.rotation));

        let newPos:vec4 = mv.mult(this.position);
        let newDir:vec4 = mv.mult(this.direction);
        newDir = newDir.normalize();

        let retList:number[] = [];
        retList.push(...newPos.flatten()); //0-3
        retList.push(...this.color.flatten()); //4-7
        retList.push(...newDir.flatten()); // 8-11
        retList.push(Math.cos(this.radiusAngle * Math.PI / 180)); // 12
        return retList;
    }

    toggleOnOff():boolean {
        this.isOn = !this.isOn;
        return this.isOn;
    }
}