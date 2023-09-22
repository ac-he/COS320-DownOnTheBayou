import {RenderObject} from "../RenderObject.js";
import {vec4} from "../helperfunctions.js";

export class Water extends RenderObject{

    constructor() {
        super();
    }

    createObjectTris() {
        let color:vec4 = new vec4(0.3, 0.5, 0.8, 1);
        let size:number = 8.0;

        this.objectTris = [];

        this.objectTris.push(new vec4(size, 0, size, 1.0));
        this.objectTris.push(color); //cyan
        this.objectTris.push(new vec4(-size, 0, size, 1.0));
        this.objectTris.push(color); //cyan
        this.objectTris.push(new vec4(-size, 0, -size, 1.0));
        this.objectTris.push(color); //cyan

        this.objectTris.push(new vec4(size, 0, size, 1.0));
        this.objectTris.push(color); //cyan
        this.objectTris.push(new vec4(size, 0, -size, 1.0));
        this.objectTris.push(color); //cyan
        this.objectTris.push(new vec4(-size, 0, -size, 1.0));
        this.objectTris.push(color); //cyan

    }
}