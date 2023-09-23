import {RenderObject} from "../RenderObject.js";
import {vec4} from "../helperfunctions.js";

export class BoatRudders extends RenderObject {

    direction:number;

    constructor() {
        super();
        this.direction = 0;
    }

    createObjectTris(): void {
        this.objectTris = [];

        //  A---B
        //  |   |      0   1   2
        //  |   |      ||  ||  ||
        //  D---C

        let a:vec4 = new vec4(0, 0.3, -0.1, 1);
        let b:vec4 = new vec4(0, 0.3, 0.1, 1);
        let c:vec4 = new vec4(0, -0.1, 0.1, 1);
        let d:vec4 = new vec4(0, -0.1, -0.1, 1);
        let color:vec4 = new vec4(1, 1, 0, 1);

        this.objectTris.push(a);
        this.objectTris.push(color);
        this.objectTris.push(b);
        this.objectTris.push(color);
        this.objectTris.push(c);
        this.objectTris.push(color);
        this.objectTris.push(a);
        this.objectTris.push(color);
        this.objectTris.push(d);
        this.objectTris.push(color);
        this.objectTris.push(c);
        this.objectTris.push(color);

    }

}
