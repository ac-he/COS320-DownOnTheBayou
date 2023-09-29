import {Camera} from "../helpers/camera.js";
import {mat4} from "../helpers/helperfunctions.js";
import {BoatBody} from "../objects/boatBody.js";

export class FreeRoam extends Camera {

    lensZoom:number;
    dollyZoom:number;
    boatCentered:boolean;

    constructor(boat:BoatBody) {
        super();
        this.lensZoom = 45;
        this.dollyZoom = 10;
        this.boatCentered = false;
    }

    getLookAtMat(): mat4 {
        return undefined;
    }

    getPerspectiveMat(): mat4 {
        return undefined;
    }

}