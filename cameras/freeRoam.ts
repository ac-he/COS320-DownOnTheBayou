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
        // I picked these numbers because they provide a good view of the boat and aren't at extreme values within their
        //  allowed ranges.
        this.boatCentered = false;

        this.boat = boat;
    }

    // toggle whether the camera centers on the boat or not
    toggleBoatCentered(){
        this.boatCentered = !this.boatCentered;
    }

    // go back to original settings
    reset(){
        this.lensZoom = 35;
        this.dollyZoom = 16;
        this.boatCentered = false;
    }

    // change lens zoom while keeping its value reasonable
    changeLensZoomBy(amount:number){
        this.lensZoom += amount;
        // make sure lens zoom is within reason
        if(this.lensZoom >= 70){ // max
            this.lensZoom = 70;
        } else if(this.lensZoom <= 10){ // min
            this.lensZoom = 10;
        }
    }

    // change dolly zoom while keeping its value reasonable
    changeDollyZoomBy(amount:number){
        this.dollyZoom += amount;
        // ensure dolly zoom is within reason
        if(this.dollyZoom >= 32){ // max
            this.dollyZoom = 32;
        } else if(this.dollyZoom <= 8){ // min
            this.dollyZoom = 8;
        }
    }

    /* ~~~ Free Roam Camera's LookAt Matrix ~~~
    * Free Roam Mode requires the camera to be centered either at the origin or on the boat. This is the matrix that
    *   handles dolly zoom, since dolly zoom is achieved by moving the camera.
    * When the camera is toggled to center on the boat, it is located at the boat's position, offset by the dolly zoom
    *   parameter (which controls the distance between the boat and the camera) in the Y and Z directions. Not zooming
    *   in the X direction allows the camera to remain "in front of" the scene, looking at it from the side, rather than
    *   from a corner. The camera then aims at the boat.
    * When the camera is toggled to center at the origin, it is located above the origin, once again offset by the dolly
    *   zoom parameter in the X and Z directions only. It also aims at the origin rather than at the boat.
    */
    getLookAtMat(): mat4 {
        let eye:vec4;
        let at:vec4;

        // if the camera is centered on the boat...
        if(this.boatCentered){
            // move the camera towards/away from the boat as desired
            eye = new vec4(this.boat.xPos, this.dollyZoom, this.boat.zPos - this.dollyZoom, 1);
            // look at the boat
            at = new vec4(this.boat.xPos, 0, this.boat.zPos, 1);
        }
        // if the camera is centered at the origin...
        else {
            // move the camera towards/away from origin as desired
            eye = new vec4(0, this.dollyZoom, -this.dollyZoom, 1);
            // look at the origin
            at = new vec4(0, 0, 0, 1);
        }

        // up is always going to be in the pos Y direction
        let up:vec4 = new vec4(0, 1, 0, 0) // up

        return lookAt(eye, at, up);
    }

    /* ~~~ Free Roam Camera's Perspective Matrix ~~~
    * Free roam allows for changes in the Perspective matrix in order to accomplish the effect of lens zoom. By changing
    *   the field of view, the boat can be made to look larger or smaller, despite the camera remaining in the same
    *   location.
    */
    getPerspectiveMat(): mat4 {
        // lens zoom controls the field of view
        return perspective(this.lensZoom, this.aspectRatio, 1, 100);
    }

}