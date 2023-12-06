import {GLContext} from "../helpers/glContext.js";
import {initFileShaders} from "../helpers/helperfunctions.js";


export class AccumulationDepthGLContext extends GLContext {

    private lightRays:number;
    private aperture:number;
    private focalDistance:number;

    getFileShaders():WebGLProgram {
        return initFileShaders(this.gl, "../shaders/ab-vertexShader.glsl",
            "../shaders/ab-fragmentShader.glsl");
    }

    setLightRayCount(lightRays:number):void {
        this.lightRays = lightRays;
    }

    setAperture(aperture:number):void {
        this.aperture = aperture;
    }

    setFocalDistance(distance:number):void {
        this.focalDistance = distance;
    }


}