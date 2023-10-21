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

        //    E-----F
        //   /|    /|
        //  A-----B |
        //  | H---|-G
        //  |/    |/
        //  D-----C

        let a:vec4 = new vec4(0.005, 0.2, -0.1, 1);
        let b:vec4 = new vec4(0.005, 0.2, 0.1, 1);
        let c:vec4 = new vec4(0.005, -0.1, 0.1, 1);
        let d:vec4 = new vec4(0.005, -0.1, -0.1, 1);
        let e:vec4 = new vec4(-0.005, 0.2, -0.1, 1);
        let f:vec4 = new vec4(-0.005, 0.2, 0.1, 1);
        let g:vec4 = new vec4(-0.005, -0.1, 0.1, 1);
        let h:vec4 = new vec4(-0.005, -0.1, -0.1, 1);
        let color:vec4 = new vec4(0.2, 0.2, 0.2, 1);

        // 1: ABCD  -- left facing
        this.objectTris.push(a);
        this.objectTris.push(color);
        this.objectTris.push(c);
        this.objectTris.push(color);
        this.objectTris.push(b);
        this.objectTris.push(color);

        this.objectTris.push(a);
        this.objectTris.push(color);
        this.objectTris.push(d);
        this.objectTris.push(color);
        this.objectTris.push(c);
        this.objectTris.push(color);

        // 2: EFGH -- right facing
        this.objectTris.push(e);
        this.objectTris.push(color);
        this.objectTris.push(f);
        this.objectTris.push(color);
        this.objectTris.push(g);
        this.objectTris.push(color);

        this.objectTris.push(e);
        this.objectTris.push(color);
        this.objectTris.push(g);
        this.objectTris.push(color);
        this.objectTris.push(h);
        this.objectTris.push(color);

        // 3: BCGF -- back facing
        this.objectTris.push(b);
        this.objectTris.push(color);
        this.objectTris.push(c);
        this.objectTris.push(color);
        this.objectTris.push(f);
        this.objectTris.push(color);

        this.objectTris.push(c);
        this.objectTris.push(color);
        this.objectTris.push(g);
        this.objectTris.push(color);
        this.objectTris.push(f);
        this.objectTris.push(color);

        // 4: ADEH -- front facing
        this.objectTris.push(a);
        this.objectTris.push(color);
        this.objectTris.push(e);
        this.objectTris.push(color);
        this.objectTris.push(d);
        this.objectTris.push(color);

        this.objectTris.push(e);
        this.objectTris.push(color);
        this.objectTris.push(d);
        this.objectTris.push(color);
        this.objectTris.push(h);
        this.objectTris.push(color);

        // 5: ABFE -- top facing
        this.objectTris.push(a);
        this.objectTris.push(color);
        this.objectTris.push(e);
        this.objectTris.push(color);
        this.objectTris.push(b);
        this.objectTris.push(color);

        this.objectTris.push(b);
        this.objectTris.push(color);
        this.objectTris.push(e);
        this.objectTris.push(color);
        this.objectTris.push(f);
        this.objectTris.push(color);

        // 6 : ABFE - bottom facing
        this.objectTris.push(c);
        this.objectTris.push(color);
        this.objectTris.push(g);
        this.objectTris.push(color);
        this.objectTris.push(d);
        this.objectTris.push(color);

        this.objectTris.push(d);
        this.objectTris.push(color);
        this.objectTris.push(g);
        this.objectTris.push(color);
        this.objectTris.push(h);
        this.objectTris.push(color);

    }

    setLogDebugName(): void {
        this.LOG_NAME = "BoatRudder";
    }
}
