import {RenderObject} from "../helpers/renderObject.js";
import {rotateY, rotateZ, translate, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "./boatBody.js";

export class BoatFan extends RenderObject {

    boat:BoatBody;
    constructor(boat:BoatBody) {
        super();
        this.boat = boat;
        this.direction = 8; // I think it looks less-bad if the fan starts at an angle
    }

    getTransformsSequence(): any[] {
        return [
            translate(this.boat.xPos, 0.8, this.boat.zPos), // move to match the location of the boat
            rotateY(this.boat.direction), // rotate to match the rotation of the boat

            translate(0, 0, -1), // move to where it attaches to the base
            rotateZ(this.direction) // rotate around this object's own center to make the blades spin
        ];
    }

    createObjectTris():void {
        this.objectTris = [];

        let bladeColor:vec4[] = [
            new vec4(0, 0, 1, 1),
            new vec4(0, 0.2, 0.4, 1),
            new vec4(0, 0.4, 1, 1),
            new vec4(0, 0.4, 0.6, 1)
        ];

        let centerX:number = 0;
        let centerY:number = 0;
        let zIn:number = -0.1;
        let zOut:number = 0.1;
        let bladeL:number = 0.5

        let centerIn:vec4 = new vec4(centerX, centerY, zIn, 1);
        let centerOut:vec4 = new vec4(centerX, centerY, zOut, 1);
        let bladeIn:vec4[] = [
            new vec4(centerX, centerY + bladeL, zIn, 1),
            new vec4(centerX - bladeL, centerY, zIn, 1),
            new vec4(centerX, centerY - bladeL, zIn, 1),
            new vec4(centerX + bladeL, centerY, zIn, 1)
        ];
        let bladeOut:vec4[] = [
            new vec4(centerX, centerY + bladeL, zOut, 1),
            new vec4(centerX - bladeL, centerY, zOut, 1),
            new vec4(centerX, centerY - bladeL, zOut, 1),
            new vec4(centerX + bladeL, centerY, zOut, 1)
        ];

        for(let i = 0; i < 4; i++){
            this.objectTris.push(centerIn);
            this.objectTris.push(bladeColor[i]);
            this.objectTris.push(centerOut);
            this.objectTris.push(bladeColor[i]);
            this.objectTris.push(bladeIn[i]);
            this.objectTris.push(bladeColor[i]);
            this.objectTris.push(bladeOut[i]);
            this.objectTris.push(bladeColor[i]);
            this.objectTris.push(centerOut);
            this.objectTris.push(bladeColor[i]);
            this.objectTris.push(bladeIn[i]);
            this.objectTris.push(bladeColor[i]);
        }
    }
}