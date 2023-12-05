import {glContext} from "../helpers/glContext.js";
import {initFileShaders} from "../helpers/helperfunctions.js";


export class RegularGLContext extends glContext {
    getFileShaders():WebGLProgram {
        return initFileShaders(this.gl, "../shaders/vertexShader.glsl",
            "../shaders/fragmentShader.glsl");
    }

}