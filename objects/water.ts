import {RenderObject} from "../helpers/renderObject.js";
import {translate, vec4} from "../helpers/helperfunctions.js";

export class Water extends RenderObject{

    size:number; // determines the size of this body of water
    xPos:number;
    zPos:number;

    constructor(xPos:number, zPos:number) {
        super();
        this.xPos = xPos;
        this.zPos = zPos;
    }

    createObjectPoints() {
        let color:vec4 = new vec4(0.2, 0.4, 0.7,1);
        let enabled:number = 1; // for debugging purposes, allows me to show/hide the water as desired
        this.size = 8.0;

        this.positions = [];
        this.colors = [];
        this.normals = [];

        let granularity:number = this.size/4;

        for(let x:number = -this.size; x <= this.size; x += granularity){
            for(let z:number = -this.size; z <= this.size; z += granularity){
                this.positions.push(new vec4(x, 0, z + granularity, enabled));
                this.colors.push(color);
                this.positions.push(new vec4(x + granularity, 0, z + granularity, enabled));
                this.colors.push(color);
                this.positions.push(new vec4(x, 0, z, enabled));
                this.colors.push(color);

                this.positions.push(new vec4(x, 0, z, enabled));
                this.colors.push(color);
                this.positions.push(new vec4(x + granularity, 0, z + granularity, enabled));
                this.colors.push(color);
                this.positions.push(new vec4(x + granularity, 0, z, enabled));
                this.colors.push(color);

                this.normals.push(new vec4(0, 1, 0, 0));
                this.normals.push(new vec4(0, 1, 0, 0));
                this.normals.push(new vec4(0, 1, 0, 0));
                this.normals.push(new vec4(0, 1, 0, 0));
                this.normals.push(new vec4(0, 1, 0, 0));
                this.normals.push(new vec4(0, 1, 0, 0));
            }
        }
    }

    getTransformsSequence(): any[] {
        return [translate(this.xPos, 0, this.zPos)];
    }

    setLogDebugName(): void {
        this.LOG_NAME = "Water";
    }
}