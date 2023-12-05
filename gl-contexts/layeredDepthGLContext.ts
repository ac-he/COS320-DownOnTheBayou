import {GLContext} from "../helpers/glContext.js";
import {initFileShaders} from "../helpers/helperfunctions.js";


export class LayeredDepthGLContext extends GLContext {
    getFileShaders():WebGLProgram {
        return initFileShaders(this.gl, "../shaders/ldof-vertexShader.glsl",
            "../shaders/ldof-fragmentShader.glsl");
    }

}