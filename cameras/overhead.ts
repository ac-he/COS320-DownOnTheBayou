import {Camera} from "../helpers/camera.js";
import {lookAt, mat4, perspective, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "../objects/boatBody.js";

export class Overhead extends Camera {

    boat:BoatBody;

    constructor(boat:BoatBody, aspectRatio:number) {
        super(aspectRatio);
        this.boat = boat;
    }

    /* ~~~ Overhead Camera's LookAt Matrix ~~~
    * The overhead camera is located at a fixed height above the boat and rotates to match the direction of the boat.
    * The camera always aims directly down at the boat.
    */
    getLookAtMat(): mat4 {
        // locate the eye above the boat, but rotated to match the direction of the boat
        let eye:vec4 = new vec4(
            // boat position
            this.boat.xPos,
            // locate the camera 20 units above the water. I picked this number because it allows for almost all of the
            //      navigable map to be seen at any given angle.
            20,
            // boat position
            this.boat.zPos,
            1
        );

        // the canvas is always centered at the boat
        let at:vec4 = new vec4(this.boat.xPos, 0, this.boat.zPos, 1);

        // up is the direction that the boat is facing
        let up:vec4 = new vec4(Math.sin(this.boat.direction * Math.PI / 180), 0, Math.cos(this.boat.direction * Math.PI / 180), 0) // up

        return lookAt(eye, at, up);
    }

    /* ~~~ Overhead Camera's Perspective Matrix ~~~
    * Overhead Mode doesn't require any changes in the Perspective matrix. 45 degrees is a good basic view of the scene
    *   and provides just the right amount of zoom. Changing this number will alter the "lens zoom" effect.
    */
    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(45, this.aspectRatio, 1, 100);
    }

}