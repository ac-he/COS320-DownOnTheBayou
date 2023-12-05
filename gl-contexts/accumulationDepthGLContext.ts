import {GLContext} from "../helpers/glContext.js";
import {initFileShaders} from "../helpers/helperfunctions.js";


export class AccumulationDepthGLContext extends GLContext {
    getFileShaders():WebGLProgram {
        return initFileShaders(this.gl, "../shaders/ab-vertexShader.glsl",
            "../shaders/ab-fragmentShader.glsl");
    }

}