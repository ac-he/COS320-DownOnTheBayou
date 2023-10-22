import {RenderObject} from "../helpers/renderObject.js";
import {rotateY, translate, vec4} from "../helpers/helperfunctions.js";
import {Water} from "./water.js";

export class BoatBody extends RenderObject {

    water:Water; // the water this boat is sitting on

    constructor(water:Water) {
        super();
        this.water = water; // used to make sure the boat doesn't leave the water
        this.direction = 10; // I think it looks less-bad if the boat starts at an angle
    }

    moveBy(speed:number) {
        // move in the specified X direction
        this.xPos += Math.sin(this.direction * Math.PI / 180) * speed;
        // don't let the boat go outside the water
        if(this.xPos >= this.water.size * 0.9) {
            this.xPos = this.water.size * 0.9
        } else if (this.xPos <= -this.water.size * 0.9) {
            this.xPos = -this.water.size * 0.9
        }

        // move in the specified Z direction
        this.zPos += Math.cos(this.direction * Math.PI / 180) * speed;
        // don't let the boat go outside the water
        if(this.zPos >= this.water.size * 0.9) {
            this.zPos = this.water.size * 0.9
        } else if (this.zPos <= -this.water.size * 0.9) {
            this.zPos = -this.water.size * 0.9
        }
    }

    getTransformsSequence(): any[] {
        return [
            translate(this.xPos, 0, this.zPos), // move into position
            rotateY(this.direction) // rotate
        ];
    }

    createObjectPoints() {
        this.positions = [];
        this.colors = [];
        //color palette
        let frontFaceColor:vec4 = new vec4(1, 0, 0, 1); // ABCD
        let backFaceColor:vec4 = new vec4(1, 0, 0, 1); // EFGH
        let topFaceColor:vec4 = new vec4(0.4, 0.4, 0.4, 1); // ABGF
        let bottomFaceColor:vec4 = new vec4(0.2, 0.2, 0.2, 1); // CDEH
        let leftFaceColor:vec4 = new vec4(0.7, 0.3, 0.3, 1); // BCHG
        let rightFaceColor:vec4 = new vec4(0.7, 0.3, 0.3, 1); // ADEF
        let fanAttachmentColor:vec4 = new vec4(0.5, 0.5, 0.5, 1);

        //       E ____ F
        //      /|     /|
        //     / H ___/ G
        //    A ____ B /
        //    |/     |/
        //    D ____ C

        // Points a-h will define the main body of the boat
        let a:vec4 = new vec4(-0.5, 0.5, 1, 1);
        let b:vec4 = new vec4(0.5, 0.5, 1, 1);
        let c:vec4 = new vec4(0.5, 0, 0.7, 1);
        let d:vec4 = new vec4(-0.5, 0, 0.7, 1);
        let e:vec4 = new vec4(-0.5, 0.2, -1, 1);
        let f:vec4 = new vec4(0.5, 0.2, -1, 1);
        let g:vec4 = new vec4(0.5, 0, -1, 1);
        let h:vec4 = new vec4(-0.5, 0, -1, 1);

        // these points define the corners of the fan base
        let fanBaseL:vec4 = new vec4(-0.2, 0.2, -0.9, 1);
        let fanBaseR:vec4 = new vec4(0.2, 0.2, -0.9, 1);
        let fanBaseC:vec4 = new vec4(0, 0.2, -0.6, 1);
        let fanAttachment:vec4 = new vec4(0, 0.9, -0.9, 1);

        //front face ABCD
        this.positions.push(c);
        this.colors.push(frontFaceColor);
        this.positions.push(a);
        this.colors.push(frontFaceColor);
        this.positions.push(b);
        this.colors.push(frontFaceColor);

        this.positions.push(a);
        this.colors.push(frontFaceColor);
        this.positions.push(c);
        this.colors.push(frontFaceColor);
        this.positions.push(d);
        this.colors.push(frontFaceColor);

        //back face EFGH
        this.positions.push(e);
        this.colors.push(backFaceColor);
        this.positions.push(g);
        this.colors.push(backFaceColor);
        this.positions.push(f);
        this.colors.push(backFaceColor);

        this.positions.push(e);
        this.colors.push(backFaceColor);
        this.positions.push(h);
        this.colors.push(backFaceColor);
        this.positions.push(g);
        this.colors.push(backFaceColor);

        //left face BCFG
        this.positions.push(b);
        this.colors.push(leftFaceColor);
        this.positions.push(g);
        this.colors.push(leftFaceColor);
        this.positions.push(c);
        this.colors.push(leftFaceColor);

        this.positions.push(b);
        this.colors.push(leftFaceColor);
        this.positions.push(f);
        this.colors.push(leftFaceColor);
        this.positions.push(g);
        this.colors.push(leftFaceColor);

        //right face ADEH
        this.positions.push(a);
        this.colors.push(rightFaceColor);
        this.positions.push(d);
        this.colors.push(rightFaceColor);
        this.positions.push(e);
        this.colors.push(rightFaceColor);

        this.positions.push(d);
        this.colors.push(rightFaceColor);
        this.positions.push(h);
        this.colors.push(rightFaceColor);
        this.positions.push(e);
        this.colors.push(rightFaceColor);

        //top ABEF
        this.positions.push(a);
        this.colors.push(topFaceColor);
        this.positions.push(b);
        this.colors.push(topFaceColor);
        this.positions.push(e);
        this.colors.push(topFaceColor);

        this.positions.push(b);
        this.colors.push(topFaceColor);
        this.positions.push(f);
        this.colors.push(topFaceColor);
        this.positions.push(e);
        this.colors.push(topFaceColor);

        //bottom CDGH
        this.positions.push(c);
        this.colors.push(bottomFaceColor);
        this.positions.push(d);
        this.colors.push(bottomFaceColor);
        this.positions.push(h);
        this.colors.push(bottomFaceColor);

        this.positions.push(h);
        this.colors.push(bottomFaceColor);
        this.positions.push(g);
        this.colors.push(bottomFaceColor);
        this.positions.push(c);
        this.colors.push(bottomFaceColor);


        //fan base
        // ALR -- back
        this.positions.push(fanAttachment);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseR);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseL);
        this.colors.push(fanAttachmentColor);
        // ACL -- left front
        this.positions.push(fanAttachment);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseL);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseC);
        this.colors.push(fanAttachmentColor);
        // ARC  -- right front
        this.positions.push(fanAttachment);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseC);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseR);
        this.colors.push(fanAttachmentColor);

        // CRL - bottom
        this.positions.push(fanBaseR);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseC);
        this.colors.push(fanAttachmentColor);
        this.positions.push(fanBaseL);
        this.colors.push(fanAttachmentColor);
    }

    setLogDebugName(): void {
        this.LOG_NAME = "BoatBody";
    }

}