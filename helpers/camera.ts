import {mat4} from "./helperfunctions.js";

export abstract class Camera {
    abstract getLookAtMat():mat4;
    abstract getPerspectiveMat():mat4;
}