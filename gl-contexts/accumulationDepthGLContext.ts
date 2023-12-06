import {GLContext} from "../helpers/glContext.js";
import {initFileShaders, lookAt, mat4, translate, vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light";
import {Camera} from "../helpers/camera";
import {RenderObject} from "../helpers/renderObject";


export class AccumulationDepthGLContext extends GLContext {

    private lightRays:number;
    private aperture:number;
    private focalDistance:number;

    setLightRayCount(lightRays:number):void {
        this.lightRays = lightRays;
    }

    setAperture(aperture:number):void {
        this.aperture = aperture;
    }

    setFocalDistance(distance:number):void {
        this.focalDistance = distance;
    }

    render(lights:Light[], camera:Camera, objects:RenderObject[]):void{

        // set up projection matrix
        let p: mat4 = camera.getPerspectiveMat();

        this.clearAndSetPerspective(p);

        let object:vec4 = camera.getAt().subtract(camera.getEye());
        object = object.normalize();
        object = new vec4(
            object[0] * this.focalDistance,
            object[1] * this.focalDistance,
            object[2] * this.focalDistance,
            object[3] * this.focalDistance,
        )

        // find the vectors that make up the plane perpendicular to the camera centered at the focal object
        // p_right = (object - eye) x up
        let p_right:vec4 = (camera.getAt().cross(camera.getUp()))
        // p_up = (object - eye) x right
        //todo is object - eye the same as the at vector?????
        let p_up:vec4 = (camera.getAt().cross(p_right))

        for(let i = 0; i < this.lightRays; i++){
            let angle = i * 2 * Math.PI / this.lightRays;
            let bokeh:vec4 = new vec4(
                (p_right[0] * Math.cos(angle) + p_up[0] * Math.sin(angle)) * this.aperture,
                (p_right[1] * Math.cos(angle) + p_up[1] * Math.sin(angle)) * this.aperture,
                (p_right[2] * Math.cos(angle) + p_up[2] * Math.sin(angle)) * this.aperture,
                (p_right[3] * Math.cos(angle) + p_up[3] * Math.sin(angle)) * this.aperture,
            )

            // set up model view matrix
            let mv: mat4 = lookAt(camera.getEye().add(bokeh), camera.getAt(), camera.getUp());
            mv = mv.mult(translate(0, 0, 0));
            let commonMat: mat4 = mv;

            this.setLights(lights, mv);
            this.draw(commonMat, objects, true);

            // todo this isn't actually using the accumulation buffer
        }


    }

}