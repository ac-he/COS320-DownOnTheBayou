import {RenderObject} from "../helpers/renderObject.js";
import {Water} from "./water.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";

export class Cabin extends RenderObject {
    getTransformsSequence(): any[] {
        return [];
    }

    setLogDebugName(): void {
    }

    water: Water; // the water this boat is sitting on

    constructor(water: Water, direction: number, xPos: number, zPos: number) {
        super();
        this.water = water;
        this.direction = direction;
        this.xPos = xPos;
        this.zPos = zPos;
    }

    // Get the specular exponent associated with this object
    getSpecularExponent(): number {
        return 500;
    }

    // Generates a random tree
    createObjectPoints(): void {
        this.positions = [];
        this.colors = [];
        this.normals = [];

        this.createPilings();
        this.createPlatform();
    }

    private getRandomWoodColor():vec4 {
        // Get a random selection of trunk colors to use in drawing trees
        let colorR:number = 66/255;
        let colorG:number = 52/255;
        let colorB:number = 39/255;
        let colors:vec4[] = [];
        let numTrunkColors:number = 1;

        return new vec4(
            colorR * (Math.random() * 0.4 + 1) ,
            colorG * (Math.random() * 0.2 + 1) ,
            colorB * (Math.random() * 0.1 + 1) ,
            1
        )
    }

    private createPlatform():void{
        let leftX:number = -2.75;
        let rightX:number = 2.75;
        let bottomY:number = 0.6;
        let topY:number = 0.75;
        let backZ = -1.75;
        let frontZ = 1.75;

        let plankNumber = 10;
        let plankWidth = (rightX - leftX)/plankNumber;

        let leftBottomBack:vec4 = new vec4(leftX, bottomY, backZ, 1);
        let rightBottomBack:vec4 = new vec4(rightX, bottomY, backZ, 1);
        let leftBottomFront:vec4 = new vec4(leftX , bottomY, frontZ, 1);
        let rightBottomFront:vec4 = new vec4(rightX, bottomY, frontZ, 1);

        this.positions.push(leftBottomBack);
        this.positions.push(rightBottomBack);
        this.positions.push(leftBottomFront);
        let woodColor = this.getRandomWoodColor()
        this.colors.push(woodColor, woodColor, woodColor);
        let n = this.calculateTriangleNormal(leftBottomBack, leftBottomFront, rightBottomBack);
        this.normals.push(n, n, n);

        this.positions.push(rightBottomBack);
        this.positions.push(rightBottomFront);
        this.positions.push(leftBottomFront);
        woodColor = this.getRandomWoodColor()
        this.colors.push(woodColor, woodColor, woodColor);
        n = this.calculateTriangleNormal(leftBottomBack, leftBottomFront, rightBottomBack);
        this.normals.push(n, n, n);
    }

    private createPilings():void{


        let centerX:number[] = [-2.25, -2.25, -2.25, -0.75, -0.75, 0.75, 0.75, 2.25, 2.25, 2.25];
        let centerY:number[] = [0,      1.5,   -1.5,   1.5,  -1.5,  1.5, -1.5,  1.5, -1.5, 0];
        let ptsPerCircle:number = 8;
        let radius:number = 0.25;
        let height:number = 0.6;

        let circleX:number[] = [];
        let circleY:number[] = [];

        // calculate the points along the circle
        for (let i: number = 0; i < ptsPerCircle; i++) {
            circleX.push(radius * Math.cos((Math.PI * i) / (ptsPerCircle / 2)));
            circleY.push(radius * Math.sin((Math.PI * i) / (ptsPerCircle / 2)));
        }
        circleX.push(circleX[0]);
        circleY.push(circleY[0]);

        let numPilings = centerX.length;
        for(let p = 0; p < numPilings; p++) {
            let woodColor:vec4 = this.getRandomWoodColor();
            // connect those points
            for (let i: number = 0; i < ptsPerCircle; i++) {
                let a1: vec4 = new vec4(centerX[p] + circleX[i + 1], height, centerY[p] + circleY[i + 1], 1);
                let b1: vec4 = new vec4(centerX[p] + circleX[i], height, centerY[p] + circleY[i], 1);
                let a2 = new vec4(centerX[p] + circleX[i], 0, centerY[p] + circleY[i],1);
                let b2 = new vec4(centerX[p] + circleX[i + 1], 0, centerY[p] + circleY[i + 1],1);

                this.positions.push(b1);
                this.positions.push(a2);
                this.positions.push(b2);
                this.colors.push(woodColor, woodColor, woodColor);
                console.log(this.positions);
                let n = this.calculateTriangleNormal(b1, a2, b2);
                this.normals.push(n, n, n);

                this.positions.push(b2);
                this.positions.push(a1);
                this.positions.push(b1);
                this.colors.push(woodColor, woodColor, woodColor);
                console.log(this.positions);
                n = this.calculateTriangleNormal(b2, a1, b1);
                this.normals.push(n, n, n);
            }
        }
    }
}