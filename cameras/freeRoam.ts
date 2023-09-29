import {Camera} from "../helpers/camera.js";
import {lookAt, mat4, perspective, vec4} from "../helpers/helperfunctions.js";
import {BoatBody} from "../objects/boatBody.js";

export class FreeRoam extends Camera {

    lensZoom:number;
    dollyZoom:number;
    boatCentered:boolean;

    boat:BoatBody;

    constructor(boat:BoatBody, aspectRatio:number) {
        super(aspectRatio);
        this.lensZoom = 35;
        this.dollyZoom = 16;
        this.boatCentered = false;

        this.boat = boat;
    }

    toggleBoatCentered(){
        this.boatCentered = !this.boatCentered;
    }

    reset(){
        this.lensZoom = 35;
        this.dollyZoom = 16;
        this.boatCentered = false;
    }

    changeLensZoomBy(amount:number){
        this.lensZoom += amount;
        // make sure lens zoom is within reason
        if(this.lensZoom >= 70){
            this.lensZoom = 70;
        } else if(this.lensZoom <= 10){
            this.lensZoom = 10;
        }
    }

    changeDollyZoomBy(amount:number){
        this.dollyZoom += amount;
        if(this.dollyZoom >= 32){
            this.dollyZoom = 32;
        } else if(this.dollyZoom <= 8){
            this.dollyZoom = 8;
        }
    }

    getLookAtMat(): mat4 {
        // dolly zoom alters where the eye is located (moving the eye closer/further to the "at")
        // goal: get spacebar to rotate
        let eye:vec4 = new vec4(0, this.dollyZoom, -this.dollyZoom, 1); // eye

        // where to center the canvas?
        // at the origin if not centered at boat
        let at:vec4 = new vec4(0, 0, 0, 1); // at
        // at boat if centered at boat
        if(this.boatCentered){
            at = new vec4(this.boat.xPos, 0, this.boat.zPos, 1);
        }

        // up is always going to be in the pos Y direction
        let up:vec4 = new vec4(0, 1, 0, 0) // up

        return lookAt(eye, at, up);
    }

    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(this.lensZoom, this.aspectRatio, 1, 100);
    }

}