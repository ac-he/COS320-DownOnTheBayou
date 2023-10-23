import {RenderObject} from "../helpers/renderObject.js";
import {Water} from "./water.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";

export class Tree extends RenderObject {

    water: Water; // the water this boat is sitting on

    constructor(water: Water, direction:number, xPos:number, zPos:number) {
        super();
        this.water = water;
        this.direction = direction;
        this.xPos = xPos;
        this.zPos = zPos;

        this.calculateNormals();
    }

    // Generates a random tree
    createObjectPoints(): void {
        this.positions = [];
        this.colors = [];

        // Get a random selection of trunk colors to use in drawing trees
        let trunkColorR:number = 55/255;
        let trunkColorG:number = 49/255;
        let trunkColorB:number = 33/255;
        let trunkColors:vec4[] = [];
        let numTrunkColors:number = 1;
        for (let i = 0; i < numTrunkColors; i++){
            trunkColors.push(new vec4(
                trunkColorR * (Math.random() * 0.4 + 1) ,
                trunkColorG * (Math.random() * 0.2 + 1) ,
                trunkColorB * (Math.random() * 0.1 + 1) ,
                1
            ))
        }

        // Get a random selection of leaf colors to use in drawing trees
        let leafColorR:number = 0.1;
        let leafColorG:number = 0.3;
        let leafColorB:number = 0.1;
        let leafColors:vec4[] = [];
        let numLeafColors:number = 8;
        for (let i = 0; i < numLeafColors; i++){
            leafColors.push(new vec4(
                leafColorR * (Math.random() * 0.2 + 1) ,
                leafColorG * (Math.random() * 0.4 + 1) ,
                leafColorB * (Math.random() * 0.2 + 1) ,
                1
            ))
        }

        // Trunk is a series of truncated cone-oids. The trunk base lists store the points around the "circle" at each "level"
        let trunkBaseX0:number[] = [];
        let trunkBaseZ0:number[] = [];
        let trunkBaseX1:number[] = [];
        let trunkBaseZ1:number[] = [];
        let trunkBaseX2:number[] = [];
        let trunkBaseZ2:number[] = [];

        // in case I want to off-center it later?
        let centerX:number = this.xPos;
        let centerZ:number = this.zPos;

        // number of "sides" each trunk has
        let ptsPerCircle:number = 12;
        // radius of the tree
        let radius:number = 0.5;
        // heights of each level of the tree
        let heights:number[] = [
            0,  // water
            1 + (Math.random() - 0.5) * 0.3, // roots
            4 + (Math.random() - 0.5) * 0.3, // branches
            6 + (Math.random() - 0.5) * 0.5 // tip
        ];

        // get the points for each side of trunk
        for(let i:number = 0; i < ptsPerCircle; i++){
            // this number will be used to modify the radius
            let rModifier:number = Math.random() + 0.3;

            // base level
            trunkBaseX0.push(centerX + radius * rModifier * Math.cos((Math.PI * i)/ (ptsPerCircle/2)));
            trunkBaseZ0.push(centerZ + radius * rModifier * Math.sin((Math.PI * i)/ (ptsPerCircle/2)));

            // make the first level smaller and add some skew
            rModifier *= 0.6;
            let skew = Math.random() * 10;
            trunkBaseX1.push(centerX + radius * rModifier * Math.cos((Math.PI * i + skew)/ (ptsPerCircle/2)));
            trunkBaseZ1.push(centerZ + radius * rModifier * Math.sin((Math.PI * i + skew)/ (ptsPerCircle/2)));

            // make the second level even smaller and add more skew
            rModifier *= 0.4;
            skew -= Math.random() * 5;
            trunkBaseX2.push(centerX + radius * rModifier * Math.cos((Math.PI * i + skew)/ (ptsPerCircle/2)));
            trunkBaseZ2.push(centerZ + radius * rModifier * Math.sin((Math.PI * i + skew)/ (ptsPerCircle/2)));
        }

        // Push the starting points again at the end so that the shapes "close"
        trunkBaseX0.push(trunkBaseX0[0]);
        trunkBaseZ0.push(trunkBaseZ0[0]);
        trunkBaseX1.push(trunkBaseX1[0]);
        trunkBaseZ1.push(trunkBaseZ1[0]);
        trunkBaseX2.push(trunkBaseX2[0]);
        trunkBaseZ2.push(trunkBaseZ2[0]);

        // create the tree trunk
        for(let i:number = 0; i < ptsPerCircle; i++) {
            // create the level 1 sides
            this.positions.push(new vec4(trunkBaseX0[i], heights[0], trunkBaseZ0[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX1[i], heights[1], trunkBaseZ1[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX0[i + 1], 0, trunkBaseZ0[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);

            this.positions.push(new vec4(trunkBaseX0[i + 1], heights[0], trunkBaseZ0[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX1[i], heights[1], trunkBaseZ1[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX1[i + 1], heights[1], trunkBaseZ1[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);

            // create the level 2 sides
            this.positions.push(new vec4(trunkBaseX1[i], heights[1], trunkBaseZ1[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX2[i], heights[2], trunkBaseZ2[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX1[i + 1], heights[1], trunkBaseZ1[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);

            this.positions.push(new vec4(trunkBaseX1[i + 1], heights[1], trunkBaseZ1[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX2[i], heights[2], trunkBaseZ2[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX2[i + 1], heights[2], trunkBaseZ2[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);

            // create the level 3 sides
            this.positions.push(new vec4(trunkBaseX2[i], heights[2], trunkBaseZ2[i], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(centerX, heights[3], centerZ, 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
            this.positions.push(new vec4(trunkBaseX2[i + 1], heights[2], trunkBaseZ2[i + 1], 1));
            this.colors.push(trunkColors[i % numTrunkColors]);
        }

        // create the branches at levels 2 and 3
        for (let h:number = 2; h < 4; h++){
            // per face of the trunk
            for(let i:number = 0; i < ptsPerCircle; i++){
                // decide if a branch should be drawn here
                if(Math.random() > 0.3333 * (h - 1)){
                    // generate key points on the branch
                    let branchAngleL = (Math.PI * (i - 0.85))/ (ptsPerCircle/2);
                    let branchAngleR = (Math.PI * (i + 0.85))/ (ptsPerCircle/2);
                    let branchAngleM = (Math.PI * i) / (ptsPerCircle/2);
                    // decide on random dimensions for this branch
                    let branchLength = (Math.random() + 1) / (h - 1);
                    let branchHeight = heights[h] + (Math.random() - 2) * 0.3;

                    // create points
                    let baseL = new vec4(
                        centerX + Math.cos(branchAngleL) * 0.05,
                        branchHeight,
                        centerX + Math.sin(branchAngleL) * 0.05,
                        1
                    );
                    let baseR = new vec4(
                        centerX + Math.cos(branchAngleR) * 0.01,
                        branchHeight,
                        centerX + Math.sin(branchAngleR) * 0.05,
                        1
                    );
                    let baseT = new vec4(
                        centerX + Math.cos(branchAngleM) * 0.05,
                        branchHeight + 0.1,
                        centerX + Math.sin(branchAngleM) * 0.05,
                        1
                    );
                    let end = new vec4(
                        centerX + Math.cos(branchAngleM) * branchLength,
                        branchHeight - 0.1,
                        centerX + Math.sin(branchAngleM) * branchLength,
                        1
                    );

                    // bottom of the branch
                    this.positions.push(end);
                    this.colors.push(trunkColors[0%numTrunkColors]);
                    this.positions.push(baseR);
                    this.colors.push(trunkColors[0%numTrunkColors]);
                    this.positions.push(baseL);
                    this.colors.push(trunkColors[0%numTrunkColors]);

                    // top left of the branch
                    this.positions.push(end);
                    this.colors.push(trunkColors[1%numTrunkColors]);
                    this.positions.push(baseL);
                    this.colors.push(trunkColors[1%numTrunkColors]);
                    this.positions.push(baseT);
                    this.colors.push(trunkColors[1%numTrunkColors]);

                    // top right of the branch
                    this.positions.push(end);
                    this.colors.push(trunkColors[2%numTrunkColors]);
                    this.positions.push(baseR);
                    this.colors.push(trunkColors[2%numTrunkColors]);
                    this.positions.push(baseL);
                    this.colors.push(trunkColors[2%numTrunkColors]);

                    // add leaves
                    let numLeaves = (Math.random() * 30 + 10)/(h - 1);
                    for(let l = 0; l < numLeaves; l++){
                        // randomly decide on the top center of this leaf
                        let leafCenterX = Math.cos(branchAngleM) * branchLength * (Math.random() + 0.3) + 0.1;
                        let leafCenterZ = Math.sin(branchAngleM) * branchLength * (Math.random() + 0.3) + 0.1;
                        let leafTopPos1 = new vec4(
                            centerX + leafCenterX + (Math.random() - 0.5) * 0.3,
                            branchHeight + 0.1 * Math.random(),
                            centerZ + leafCenterZ + (Math.random() - 0.5) * 0.3,
                            1
                        );
                        let leafTopPos2 = new vec4(
                            centerX + leafCenterX + (Math.random() - 0.5) * 0.3,
                            branchHeight + 0.1 * Math.random(),
                            centerZ + leafCenterZ + (Math.random() - 0.5) * 0.3,
                            1
                        );
                        let leafbottomPos = new vec4(
                            centerX + leafCenterX,
                            branchHeight - 0.5 - Math.random(),
                            centerZ + leafCenterZ,
                            1
                        );

                        this.positions.push(leafTopPos1);
                        this.colors.push(leafColors[l%numLeafColors]);
                        this.positions.push(leafTopPos2);
                        this.colors.push(leafColors[l%numLeafColors]);
                        this.positions.push(leafbottomPos);
                        this.colors.push(leafColors[l%numLeafColors]);

                    } // end leaf for loop

                } // end branch if statement

            } // end branch for loop
        } // end branch level for loop
    }

    getTransformsSequence(): any[] {
        return [
            translate(this.xPos, 0, this.zPos), // move into position
            rotateY(this.direction) // rotate
        ];
    }

    setLogDebugName(): void {
        this.LOG_NAME = "Tree";
    }
}