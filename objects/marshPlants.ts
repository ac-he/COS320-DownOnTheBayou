import {RenderObject} from "../helpers/renderObject.js";
import {Water} from "./water.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";

export class MarshPlants extends RenderObject {

    water: Water; // the water this boat is sitting on

    constructor(water: Water, xPos:number, zPos:number) {
        super();

        this.water = water;
        this.xPos = xPos;
        this.zPos = zPos;
    }

    // Generates a random tree
    createObjectPoints(): void {
        this.positions = [];
        this.colors = []

       // Get a random selection of leaf colors to use in drawing trees
        let leafColorR:number = 0.2;
        let leafColorG:number = 0.4;
        let leafColorB:number = 0.2;
        let leafColors:vec4[] = [];
        let numLeafColors:number = 15;
        for (let i = 0; i < numLeafColors; i++){
            leafColors.push(
                new vec4(
                    leafColorR * (Math.random() * 0.3 + 1) ,
                    leafColorG * (Math.random() * 0.3 + 1) ,
                    leafColorB * (Math.random() * 0.3 + 1) ,
                    1
                )
            );
        }

        // add leaves
        let radius = 4.5;
        let numLeaves = (Math.random() * (Math.pow(radius, 2) * 30) + (Math.pow(radius, 2) * 40));
        for(let l = 0; l < numLeaves; l++){
            // randomly decide on the top center of this leaf
            let leafCenterX:number = Math.random() * radius * Math.cos(Math.random() * 2 * Math.PI);
            let leafCenterZ:number = Math.random() * radius * Math.sin(Math.random() * 2 * Math.PI);
            let leafBottomPos1 = new vec4(
                leafCenterX + (Math.random() - 0.5) * 0.1,
                0,
                leafCenterZ + (Math.random() - 0.5) * 0.1,
                1
            );
            let leafBottomPos2 = new vec4(
                leafCenterX + (Math.random() - 0.5) * 0.1,
                0,
                leafCenterZ + (Math.random() - 0.5) * 0.1,
                1
            );
            let leafTopPos = new vec4(
                leafCenterX,
                0.5 + Math.random(),
                leafCenterZ,
                1
            );

            this.positions.push(leafBottomPos1);
            this.colors.push(leafColors[l%numLeafColors]);
            this.positions.push(leafBottomPos2);
            this.colors.push(leafColors[l%numLeafColors]);
            this.positions.push(leafTopPos);
            this.colors.push(leafColors[l%numLeafColors]);
        } // end leaf for loop
    }

    getTransformsSequence(): any[] {
        return [
            translate(this.xPos, 0, this.zPos), // move into position
            rotateY(this.direction) // rotate
        ];
    }

    setLogDebugName(): void {
        this.LOG_NAME = "MarshPlants";
    }

}