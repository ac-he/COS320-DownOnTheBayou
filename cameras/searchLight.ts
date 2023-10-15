import {Camera} from "../helpers/camera.js";
import {lookAt, mat4, perspective, vec4} from "../helpers/helperfunctions.js";
import {BoatLight} from "../objects/boatLight.js";

export class SearchLightCamera extends Camera {

    boatLight:BoatLight;

    constructor(boatLight:BoatLight, aspectRatio:number) {
        super(aspectRatio);
        this.boatLight = boatLight;
    }

    /* ~~~ Search Light Camera's LookAt Matrix ~~~
    * Search Light's camera is located just above the center of the bow of the boat. This position is determined through
    *   trigonometry, using the known angle of the boat and an offset specified in this method that positions the camera
    *   the correct distance "in front of" the center of the boat.
    * Similarly, the camera is aimed in the direction of the search light relative to the boat, at a distance just
    *   a little bit greater than the offset used to determine the camera position, in order to keep the camera aimed
    *   in a forward direction.
    */
    getLookAtMat(): mat4 {
        let cameraHeight:number = 1.1; // height of the camera above the water
        let viewOffset:number = 0.3; // how far forward on the boat to locate the camera
                                    // (should be near the search light)

        // locate the eye above the boat, but rotated to match the direction of the boat
        let eye:vec4 = new vec4(
            // the camera is located at the boat position...
            this.boatLight.boat.xPos
                // ...offset by the specified amount...
                - viewOffset
                // ...in the direction of the boat
                * Math.sin(this.boatLight.boat.direction * Math.PI / 180),
            // locate the camera 30 units above the water
            cameraHeight,
            // the camera is located at the boat position...
                this.boatLight.boat.zPos
                // ...offset by the specified amount...
                - viewOffset
                // ...in the direction of the boat
                * Math.cos(this.boatLight.boat.direction * Math.PI / 180),
            1
        );

        // look at the location just in front of the search light
        let at:vec4 = new vec4(
            // the camera is located at the boat position...
            this.boatLight.boat.xPos
                // ...offset by the specified amount, and shifted forward slightly...
                - (viewOffset - 1)
                // ...in the direction of the boat light...as well as the boat it is attached to
                * Math.sin((this.boatLight.direction + this.boatLight.boat.direction) * Math.PI / 180),
            // locate the camera 30 units above the water
            cameraHeight,
            /// the camera is located at the boat position...
            this.boatLight.boat.zPos
                // ...offset by the specified amount, and shifted forward slightly...
                - (viewOffset - 1)
                // ...in the direction of the boat light...as well as the boat it is attached to
                * Math.cos((this.boatLight.direction + this.boatLight.boat.direction) * Math.PI / 180),
            1
        );

        // up is always going to be in the pos Y direction
        let up:vec4 = new vec4(0, 1, 0, 0); // up

        return lookAt(eye, at, up);
    }

    /* ~~~ Search Light Camera's LookAtPerspective Matrix ~~~
    * Search Light Mode doesn't require any changes in the Perspective matrix. 45 degrees is a good basic view of the
    *   scene and provides just the right amount of zoom. Changing this number will alter the "lens zoom" effect.
    */
    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(45, this.aspectRatio, 1, 100);
    }

}