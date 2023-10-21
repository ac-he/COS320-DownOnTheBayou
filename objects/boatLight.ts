import {RenderObject} from "../helpers/renderObject.js";
import {BoatBody} from "./boatBody.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";

export class BoatLight extends RenderObject {

    boat: BoatBody;

    constructor(boat: BoatBody) {
        super();
        this.boat = boat;
    }
    rotateBy(angle:number){
        this.direction += angle;
        if(this.direction >= 25) {
            this.direction = 25;
        } else if(this.direction <= -25) {
            this.direction = -25;
        }
    }

    getTransformsSequence(): any[] {
        let ts:any[] = this.boat.getTransformsSequence(); // use the boat's transform sequence first
        ts.push(
            translate(0, 0.5, 0.9), // move to where it attaches to the bow
            rotateY(this.direction) // rotate around this object's own center to make it turn
        );
        return ts;
    }

    createObjectTris(): void {
        this.objectTris = [];

        let lightColor:vec4 = new vec4(1, 1, 1, 1);
        let shellColor1:vec4 = new vec4(0.5, 0.5, 0.5, 1);
        let shellColor2:vec4 = new vec4(0.6, 0.6, 0.6, 1)

        let centerX:number = 0;
        let centerY:number = 0;
        let ptsPerCircle:number = 30;
        let radius:number = 0.15;
        let length:number = 0.2;

        let circleX:number[] = [];
        let circleY:number[] = [];

        // calculate the points along the circle
        for(let i:number = 0; i < ptsPerCircle; i++){
            circleX.push(centerX + radius * Math.cos((Math.PI * i)/ (ptsPerCircle/2)));
            circleY.push(centerY + radius * Math.sin((Math.PI * i)/ (ptsPerCircle/2)));
        }
        circleX.push(circleX[0]);
        circleY.push(circleY[0]);

        // connect those points
        for(let i:number = 0; i < ptsPerCircle; i++){
            // create the front face
            this.objectTris.push(new vec4(centerX, centerY, length, 1));
            this.objectTris.push(lightColor);
            this.objectTris.push(new vec4(circleX[i+1], circleY[i+1], length, 1));
            this.objectTris.push(lightColor);
            this.objectTris.push(new vec4(circleX[i], circleY[i], length, 1));
            this.objectTris.push(lightColor);

            // create the back face
            this.objectTris.push(new vec4(centerX, centerY, -length, 1));
            this.objectTris.push(shellColor1);
            this.objectTris.push(new vec4(circleX[i], circleY[i], -length, 1));
            this.objectTris.push(shellColor1);
            this.objectTris.push(new vec4(circleX[i+1], circleY[i+1], -length, 1));
            this.objectTris.push(shellColor1);

            // create the rounded edges
            this.objectTris.push(new vec4(circleX[i], circleY[i], length, 1));
            this.objectTris.push(shellColor2);
            this.objectTris.push(new vec4(circleX[i], circleY[i], -length, 1));
            this.objectTris.push(shellColor2);
            this.objectTris.push(new vec4(circleX[i+1], circleY[i+1], -length, 1));
            this.objectTris.push(shellColor2);

            this.objectTris.push(new vec4(circleX[(i+1)%ptsPerCircle], circleY[(i+1)%ptsPerCircle], -length, 1));
            this.objectTris.push(shellColor2);
            this.objectTris.push(new vec4(circleX[i+1], circleY[i+1], length, 1));
            this.objectTris.push(shellColor2);
            this.objectTris.push(new vec4(circleX[i], circleY[i], length, 1));
            this.objectTris.push(shellColor2);
        }
    }

    setLogDebugName(): void {
        this.LOG_NAME = "BoatLight";
    }
}