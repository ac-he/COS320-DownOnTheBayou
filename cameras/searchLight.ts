import {Camera} from "../helpers/camera.js";
import {lookAt, mat4, perspective, vec4} from "../helpers/helperfunctions.js";
import {BoatLight} from "../objects/boatLight.js";

export class SearchLightCamera extends Camera {

    boatLight:BoatLight;

    constructor(boatLight:BoatLight, aspectRatio:number) {
        super(aspectRatio);
        this.boatLight = boatLight;
    }

    getLookAtMat(): mat4 {
        console.log(this.boatLight.xPos + ", " + this.boatLight.zPos + ": " + this.boatLight.boat.direction);

        let viewOffset:number = -0.3;
        let cameraHeight:number = 1.1;
        let chaseOffset:number = 5
        ;

        // locate the eye above the boat, but rotated to match the direction of the boat
        let eye:vec4 = new vec4(
            // boat position    // rotate to match direction and offset
            this.boatLight.boat.xPos
                + viewOffset * Math.sin((this.boatLight.direction + this.boatLight.boat.direction) * Math.PI / 180),
            // locate the camera 30 units above the water
            cameraHeight,
            // boat position    // rotate to match direction and offset
            this.boatLight.boat.zPos
                + viewOffset * Math.cos((this.boatLight.direction + this.boatLight.boat.direction) * Math.PI / 180),
            1
        );

        // where to center the canvas?
        // centered at boat
        let at:vec4 = new vec4(
            // boat position    // rotate to match direction
            this.boatLight.boat.xPos
                + chaseOffset * Math.sin((this.boatLight.direction + this.boatLight.boat.direction) * Math.PI / 180),
            // locate the camera 30 units above the water
            cameraHeight,
            // boat position    // rotate to match direction
            this.boatLight.boat.zPos
                + chaseOffset * Math.cos((this.boatLight.direction + this.boatLight.boat.direction) * Math.PI / 180),
            1
        );

        console.log("looking at " + at);

        // up is always going to be in the pos Y direction
        let up:vec4 = new vec4(0, 1, 0, 0); // up

        return lookAt(eye, at, up);
    }

    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(45, this.aspectRatio, 1, 100);
    }

}