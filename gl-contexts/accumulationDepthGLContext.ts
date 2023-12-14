import {GLContext} from "./glContext.js";
import {initFileShaders, lookAt, mat4, vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {Camera} from "../helpers/camera.js";
import {RenderObject} from "../helpers/renderObject.js";


export class AccumulationDepthGLContext extends GLContext {

    lightRays: number;
    aperture: number;
    focalDistance: number;

    private uFragColorSamplers: WebGLUniformLocation[];

    private textures: WebGLTexture[];
    private depthTexture: WebGLTexture;
    private fb: WebGLFramebuffer;


    private activeTextures = [
        this.gl.TEXTURE0,
        this.gl.TEXTURE1,
        this.gl.TEXTURE2,
        this.gl.TEXTURE3,
        this.gl.TEXTURE4,
        this.gl.TEXTURE5,
        this.gl.TEXTURE6,
        this.gl.TEXTURE7,
        this.gl.TEXTURE8,
        this.gl.TEXTURE9,
    ]

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.lightRays = 10;

        this.secondPassProgram = initFileShaders(this.gl, "../shaders/ab-vertexShader.glsl",
            "../shaders/ab-fragmentShader.glsl");
        this.gl.useProgram(this.secondPassProgram);
        this.uFragColorSamplers = [];
        for (let i = 0; i < this.lightRays; i++) {
            this.uFragColorSamplers[i] = this.gl.getUniformLocation(this.secondPassProgram, `uFragColorSampler${i}`);
        }

        this.gl.useProgram(this.program);
        this.makeSquareAndBuffer();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.textures = [];
        // set up textures we can render to
        for (let i = 0; i < this.lightRays; i++) {
            let newTex: WebGLTexture = this.gl.createTexture()
            this.textures.push(newTex);
            this.setupTextureBuffer(newTex);
        }

        // set up depth texture
        this.depthTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT32F, this.canvas.clientWidth,
            this.canvas.clientHeight, 0, this.gl.DEPTH_COMPONENT, this.gl.FLOAT, null); //null data for now
        //you have to specify all 4 filters to be able to read back out from a depth texture
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        // set up frame buffer
        this.fb = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);

        // add depth texture to frame buffer
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture,
            0);

        this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0]);
    }

    setAperture(aperture: number): void {
        this.aperture = aperture / 10000;
    }

    setFocalDistance(distance: number): void {
        this.focalDistance = distance / 10;
    }

    render(lights: Light[], camera: Camera, objects: RenderObject[]): void {
        // ----------------------------------
        // Part 1: Render Geometry to texture
        // ----------------------------------
        this.gl.useProgram(this.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);

        this.gl.clearColor(0.0, 0.0, 0.2, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        let object: vec4 = camera.getAt()//.subtract(camera.getEye());
        object = object.normalize();
        object = new vec4(
            object[0] * this.focalDistance,
            object[1] * this.focalDistance,
            object[2] * this.focalDistance,
            object[3],
        )

        let scaledAt: vec4 = object.subtract(camera.getEye());
        let p_right: vec4 = (scaledAt.cross(camera.getUp()))
        let p_up: vec4 = (scaledAt.cross(p_right))

        // // set up projection matrix
        let p: mat4 = camera.getPerspectiveMat();
        this.gl.uniformMatrix4fv(this.uproj, false, p.flatten());

        for (let i = 0; i < this.lightRays; i++) {
            this.gl.useProgram(this.program);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D,
                this.textures[i], 0);
            this.gl.clearColor(0.0, 0.0, 0.2, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            let angle = i * 2 * Math.PI / this.lightRays;
            let bokeh: vec4 = new vec4(
                (p_right[0] * Math.cos(angle) + p_up[0] * Math.sin(angle)) * this.aperture,
                (p_right[1] * Math.cos(angle) + p_up[1] * Math.sin(angle)) * this.aperture,
                (p_right[2] * Math.cos(angle) + p_up[2] * Math.sin(angle)) * this.aperture,
                (p_right[3] * Math.cos(angle) + p_up[3] * Math.sin(angle)) * this.aperture,
            )

            // set up model view matrix
            let mv: mat4 = lookAt(camera.getEye().add(bokeh), camera.getAt(), camera.getUp());

            this.setLights(lights, mv);

            this.setVertexArrays();

            this.draw(mv, objects);

            this.disableVertexArrays();
        }

        // ----------------------------------
        // Part 2: Render Geometry to texture
        // ----------------------------------

        this.gl.useProgram(this.secondPassProgram);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // disable the frame buffer to draw to screen

        //setting background color to black for render to screen
        this.gl.clearColor(1, 0, 0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);

        // read out of textures to set the texture uniforms for the shaders
        for (let i = 0; i < this.lightRays; i++) {
            this.gl.activeTexture(this.activeTextures[i]);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i]);
            this.gl.uniform1i(this.uFragColorSamplers[i], i);
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBufferId);

        // set vposition
        this.gl.vertexAttribPointer(this.vPositionSquare, 4, this.gl.FLOAT, false, 24, 0);
        this.gl.enableVertexAttribArray(this.vPositionSquare);

        // set vtexcoord
        this.gl.vertexAttribPointer(this.vTexCoord, 2, this.gl.FLOAT, false, 24, 16); //stride is 24 bytes total for position, texcoord
        this.gl.enableVertexAttribArray(this.vTexCoord);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);

        // disable after use
        this.gl.disableVertexAttribArray(this.vPositionSquare);
        this.gl.disableVertexAttribArray(this.vTexCoord);

    }

}