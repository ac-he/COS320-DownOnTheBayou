import {RenderObject} from "../helpers/renderObject.js";
import {rotateZ, translate, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "./boatBody.js";

export class BoatFan extends RenderObject {

    boat:BoatBody;
    constructor(boat:BoatBody) {
        super();
        this.boat = boat;
        this.direction = 8; // I think it looks less-bad if the fan starts at an angle
    }

    getTransformsSequence(): any[] {
        let ts:any[] = this.boat.getTransformsSequence(); // use the boat's transform sequence first
        ts.push(
            translate(0, 0.8, -1), // move to where it attaches to the base,
            rotateZ(this.direction) // rotate around this object's own center to make the blades spin
        );
        return ts;
    }

    createObjectPoints():void {
        this.positions = [];
        this.colors = [];
        this.normals = [];

        let bladeColor:vec4[] = [
            new vec4(0.3, 0.3, 0.3, 1),
            new vec4(0.25, 0.25, 0.25, 1),
            new vec4(0.3, 0.3, 0.3, 1),
            new vec4(0.25, 0.25, 0.25, 1),
        ];

        let centerX:number = 0;
        let centerY:number = 0;
        let zIn:number = -0.1;
        let zOut:number = 0.1;
        let bladeThickness = 0.02;
        let bladeL:number = 0.5

        let centerIn:vec4 = new vec4(centerX, centerY, zIn, 1);
        let centerOut:vec4 = new vec4(centerX, centerY, zOut, 1);
        let bladeInA:vec4[] = [
            new vec4(centerX + bladeThickness, centerY + bladeL, zIn, 1),
            new vec4(centerX - bladeL, centerY + bladeThickness, zIn, 1),
            new vec4(centerX - bladeThickness, centerY - bladeL, zIn, 1),
            new vec4(centerX + bladeL, centerY - bladeThickness, zIn, 1)
        ];
        let bladeOutA:vec4[] = [
            new vec4(centerX - bladeThickness, centerY + bladeL, zOut, 1),
            new vec4(centerX - bladeL, centerY - bladeThickness, zOut, 1),
            new vec4(centerX + bladeThickness, centerY - bladeL, zOut, 1),
            new vec4(centerX + bladeL, centerY + bladeThickness, zOut, 1)
        ];

        for(let i = 0; i < 4; i++){
            this.positions.push(centerIn);
            this.colors.push(bladeColor[i]);
            this.positions.push(bladeInA[i]);
            this.colors.push(bladeColor[i]);
            this.positions.push(centerOut);
            this.colors.push(bladeColor[i]);
            let n:vec4 = this.calculateTriangleNormal(centerIn, bladeInA[i], centerOut);
            this.normals.push(n, n, n);

            this.positions.push(bladeOutA[i]);
            this.colors.push(bladeColor[i]);
            this.positions.push(centerOut);
            this.colors.push(bladeColor[i]);
            this.positions.push(bladeInA[i]);
            this.colors.push(bladeColor[i]);

            n = this.calculateTriangleNormal(bladeOutA[i], centerOut, bladeInA[i]);
            this.normals.push(n, n, n);
        }
    }

    setLogDebugName(): void {
        this.LOG_NAME = "BoatFan";
    }
}