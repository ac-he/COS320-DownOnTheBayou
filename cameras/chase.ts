import {Camera} from "../helpers/camera.js";
import {lookAt, mat4, perspective, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "../objects/boatBody.js";

export class Chase extends Camera {

    boat:BoatBody;

    constructor(boat:BoatBody, aspectRatio:number) {
        super(aspectRatio);
        this.boat = boat;
    }

    /* ~~~ Chase Camera's LookAt Matrix ~~~
    * Chase Mode requires the camera to be located just behind the boat and just above the surface of the water.
    * The camera is set in position by using trigonometry to calculate how far away the camera should be from the center
    *   of the boat in the X and Z directions. Given the angle of this offset (the direction of the boat) and the
    *   distance/offset at which to chase, the actual location of the camera can easily be determined.
    * With the camera positioned correctly, aiming it is a matter of pointing it at the boat. To frame the shot
    *   correctly, we look above the boat, at a height level with the camera. This gives the impression of seeing the
    *   scene at eye-level.
    */
    getLookAtMat(): mat4 {
        let chaseOffset:number = 5; // how far behind the boat is the camera?
        let cameraHeight:number = 1.5;  // what is the height of the camera?
        // I landed on these numbers because they look nice and do a good job of capturing the boat and the environment!

        // locate the eye above the boat and behind it by the specified offset
        let eye:vec4 = new vec4(
            // boat position    // rotate to match direction and offset
            this.boat.xPos - chaseOffset * Math.sin(this.boat.direction * Math.PI / 180),
            // locate the camera at the specified height above the water
            cameraHeight,
            // boat position    // rotate to match direction and offset
            this.boat.zPos - chaseOffset * Math.cos(this.boat.direction * Math.PI / 180),
            1
        );

        // center the camera at the boat
        let at:vec4 = new vec4(
            // boat position
            this.boat.xPos,
            // locate the camera at the specified height above the water.
            // Looking at the same height as the camera is what allows the boat to be seen at "eye level"
            cameraHeight,
            // boat position
            this.boat.zPos,
            1
        );

        // up is always going to be in the pos Y direction
        let up:vec4 = new vec4(0, 1, 0, 0); // up

        return lookAt(eye, at, up);
    }

    /* ~~~ Chase Camera's Perspective Matrix ~~~
   * Chase Mode doesn't require any changes in the Perspective matrix. 45 degrees is a good basic view of the scene and
   *    provides just the right amount of zoom. Changing this number will alter the "lens zoom" effect.
   */
    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(45, this.aspectRatio, 1, 100);
    }

}