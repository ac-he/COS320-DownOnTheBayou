import {Camera} from "../helpers/camera.js";
import {lookAt, mat4, perspective, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "../objects/boatBody.js";

export class Overhead extends Camera {

    boat:BoatBody;

    constructor(boat:BoatBody, aspectRatio:number) {
        super(aspectRatio);
        this.boat = boat;
    }

    getLookAtMat(): mat4 {
        console.log(this.boat.xPos + ", " + this.boat.zPos);

        // locate the eye above the boat, but rotated to match the direction of the boat
        let eye:vec4 = new vec4(
            // boat position    // rotate to match direction
            this.boat.xPos - Math.sin(this.boat.direction * Math.PI / 180),
            // locate the camera 30 units above the water
            20,
            // boat position    // rotate to match direction
            this.boat.zPos - Math.cos(this.boat.direction * Math.PI / 180),
            1
        ); // eye

        // where to center the canvas?
        // centered at boat
        let at:vec4 = new vec4(this.boat.xPos, 0, this.boat.zPos, 1);
        // up is always going to be in the pos Y direction
        let up:vec4 = new vec4(0, 1, 0, 0) // up

        return lookAt(eye, at, up);
    }

    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(45, this.aspectRatio, 1, 100);
    }

}