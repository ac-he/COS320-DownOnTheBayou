import {RenderObject} from "../RenderObject.js";
import {rotateY, translate, vec4} from "../helperfunctions.js";
import {BoatBody} from "./BoatBody.js";

export class BoatRudders extends RenderObject {

    boat:BoatBody;
    offset:number;

    constructor(boat:BoatBody, offset:number) {
        super();
        this.boat = boat;
        this.offset = offset;
    }

    getTransformsSequence(): any[] {
        this.transforms = [
            translate(this.boat.xPos, 0.1, this.boat.zPos),
            rotateY(this.boat.direction),
            translate(this.offset, 0, -1.1),
            rotateY(this.direction),
            translate(0, 0, 0)
        ];

        return this.transforms;
    }

    createObjectTris(): void {
        this.objectTris = [];

        //  A---B
        //  |   |      0   1   2
        //  |   |      ||  ||  ||
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
