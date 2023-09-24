import {RenderObject} from "../helpers/renderObject.js";
import {vec4} from "../helpers/helperfunctions.js";

export class Water extends RenderObject{

    size:number; // determines the size of this body of water

    createObjectTris() {
        let color:vec4 = new vec4(0.3, 0.5, 0.8, 1);
        let enabled:number = 1; // for debugging purposes, allows me to show/hide the water as desired
        this.size = 8.0;

        this.objectTris = [];

        this.objectTris.push(new vec4(this.size, 0, this.size, enabled));
        this.objectTris.push(color);
        this.objectTris.push(new vec4(-this.size, 0, this.size, enabled));
        this.objectTris.push(color);
        this.objectTris.push(new vec4(-this.size, 0, -this.size, enabled));
        this.objectTris.push(color);

        this.objectTris.push(new vec4(this.size, 0, this.size, enabled));
        this.objectTris.push(color);
        this.objectTris.push(new vec4(this.size, 0, -this.size, enabled));
        this.objectTris.push(color);
        this.objectTris.push(new vec4(-this.size, 0, -this.size, enabled));
        this.objectTris.push(color);

    }

    getTransformsSequence(): any[] {
        return []; // the water doesn't ever move :)
    }
}