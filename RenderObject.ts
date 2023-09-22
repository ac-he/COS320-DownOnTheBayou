import {vec4} from "./helperfunctions.js";

export abstract class RenderObject {
    // where it starts in the buffer
    bufferIndex:number;
    direction:number;

    xPos:number;
    zPos:number;

    // store all the triangles that make up this object
    protected objectTris:vec4[];

    // Constructor
    constructor(){
        this.bufferIndex = 0; // will be set properly later

        this.direction = 0;
        this.xPos = this.zPos = 0;

        this.createObjectTris();
    }

    // Specify what the triangles are for this object
    abstract createObjectTris();

    // Get the list of triangles that make up this object
    getObjectTris():vec4[] {
        return this.objectTris;
    }

    // Get the number of triangles that make up this object
    getNumTris():number {
        return this.objectTris.length / 2; // because each point is made of a color vector and a position vector
    }

    rotateBy(angle:number){
        this.direction += angle;
        if(this.direction >= 360) {
            this.direction -= 360;
        }
    }

    setPosition(x:number, z:number){
        this.xPos = x;
        this.zPos = z;
    }
}

