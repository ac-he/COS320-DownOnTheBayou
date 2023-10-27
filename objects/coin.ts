import {RenderObject} from "../helpers/renderObject.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";
import {Water} from "./water.js";

export class Coin extends RenderObject {

    water:Water;

    constructor(water: Water) {
        super();
        this.water = water;
        this.move();
    }
    rotateBy(angle:number){
        this.direction += angle;
    }

    move(){
        this.xPos = (Math.random() - 0.5) * this.water.size;
        this.zPos = (Math.random() - 0.5) * this.water.size;
    }

    // Get the specular exponent associated with this object
    getSpecularExponent():number {
        return 1;
    }

    getTransformsSequence(): any[] {
        let ts:any[] = this.water.getTransformsSequence(); // use the boat's transform sequence first
        ts.push(
            translate(this.xPos, 0.5, this.zPos),
            rotateY(this.direction) // rotate around this object's own center to make it turn
        );
        return ts;
    }

    createObjectPoints(): void {
        this.positions = [];
        this.colors = [];
        this.normals = [];

        let sideColor:vec4 = new vec4(0.8, 0.7, 0, 1);
        let faceColor:vec4 = new vec4(0.9, 0.8, 0, 1);

        let centerX:number = 0;
        let centerY:number = 0;
        let ptsPerCircle:number = 60;
        let radius:number = 0.25;
        let length:number = 0.025;

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
            let center1:vec4 = new vec4(centerX, centerY, length, 1);
            let a1:vec4 = new vec4(circleX[i+1], circleY[i+1], length, 1);
            let b1:vec4 = new vec4(circleX[i], circleY[i], length, 1);
            this.positions.push(center1);
            this.colors.push(faceColor);
            this.positions.push(a1);
            this.colors.push(faceColor);
            this.positions.push(b1);
            this.colors.push(faceColor);
            let n:vec4 = this.calculateTriangleNormal(center1, b1, a1);
            this.normals.push(n, n, n);

            // create the back face
            let center2 = new vec4(centerX, centerY, -length, 1);
            let a2 = new vec4(circleX[i], circleY[i], -length, 1);
            let b2 = new vec4(circleX[i+1], circleY[i+1], -length, 1);
            this.positions.push(center2);
            this.colors.push(faceColor);
            this.positions.push(a2);
            this.colors.push(faceColor);
            this.positions.push(b2);
            this.colors.push(faceColor);
            n = this.calculateTriangleNormal(center2, b2, a2);
            this.normals.push(n, n, n);

            // create the rounded edges
            this.positions.push(b1);
            this.colors.push(sideColor);
            this.positions.push(a2);
            this.colors.push(sideColor);
            this.positions.push(b2);
            this.colors.push(sideColor);
            n = this.calculateTriangleNormal(b1, a2, b2);
            this.normals.push(n, n, n);

            this.positions.push(b2);
            this.colors.push(sideColor);
            this.positions.push(a1);
            this.colors.push(sideColor);
            this.positions.push(b1);
            this.colors.push(sideColor);
            n = this.calculateTriangleNormal(b2, a1, b1);
            this.normals.push(n, n, n);
        }
    }

    setLogDebugName(): void {
        this.LOG_NAME = "Coin";
    }
}