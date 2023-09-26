import {RenderObject} from "../helpers/renderObject.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "./boatBody.js";

export class BoatRudder extends RenderObject {

    boat:BoatBody; // the boat this rudder is attached to
    offset:number; // determines if this rudder is off-center relative to the back of the boat

    constructor(boat:BoatBody, offset:number) {
        super();
        this.boat = boat;
        this.offset = offset;
    }

    getTransformsSequence(): any[] {
        let ts:any[] = this.boat.getTransformsSequence(); // use the boat's transform sequence first
        ts.push(
            translate(this.offset, 0.1, -1.1), // Move to where it attaches to the boat
            rotateY(this.direction)  // Rotate in place to the correct direction
        );
        return ts;
    }

    createObjectTris(): void {
        this.objectTris = [];

        //  A---B
        //  |   |
        //  |   |
        //  D---C

        let a:vec4 = new vec4(0, 0.2, -0.1, 1);
        let b:vec4 = new vec4(0, 0.2, 0.1, 1);
        let c:vec4 = new vec4(0, -0.1, 0.1, 1);
        let d:vec4 = new vec4(0, -0.1, -0.1, 1);
        let color:vec4 = new vec4(Math.random(), Math.random(), 0, 1);

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
