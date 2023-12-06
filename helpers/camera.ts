import {mat4, vec4} from "./helperfunctions.js";
import {GLContext} from "./glContext";

export abstract class Camera {
    aspectRatio:number;
    constructor(aspectRatio:number) {
        this.aspectRatio = aspectRatio;
    }

    abstract getLookAtMat():mat4;
    abstract getPerspectiveMat():mat4;

    abstract getEye():vec4;
    abstract getAt():vec4;
    abstract getUp():vec4;
}