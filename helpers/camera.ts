import {mat4} from "./helperfunctions.js";

export abstract class Camera {
    aspectRatio:number;
    constructor(aspectRatio:number) {
        this.aspectRatio = aspectRatio;
    }

    abstract getLookAtMat():mat4;
    abstract getPerspectiveMat():mat4;
}