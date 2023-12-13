import {GLContext} from "../helpers/glContext.js";
import {flatten, initFileShaders, lookAt, mat4, vec2, vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light";
import {Camera} from "../helpers/camera";
import {RenderObject} from "../helpers/renderObject";


export class LayeredDepthGLContext extends GLContext {

    private tableTexture:WebGLTexture;
    private depthTexture:WebGLTexture;
    private fb:WebGLFramebuffer;

    private uTableSampler:WebGLUniformLocation;

    private spreadTable:vec4[][];

    constructor(canvas:HTMLCanvasElement) {
        super(canvas);

        this.secondPassProgram = initFileShaders(this.gl, "../shaders/ldof-vertexShader.glsl",
            "../shaders/ldof-fragmentShader.glsl");
        this.gl.useProgram(this.secondPassProgram);
        this.uTableSampler = this.gl.getUniformLocation(this.secondPassProgram, "uTableSampler");

        this.gl.useProgram(this.program);
        this.makeSquareAndBuffer();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.tableTexture = this.gl.createTexture()
        this.setupTextureBuffer(this.tableTexture);

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
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D,
            this.depthTexture, 0);

        this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0]);
    }

    render(lights:Light[], camera:Camera, objects:RenderObject[]):void{
        // ----------------------------------
        // Part 1: Render Geometry to texture
        // ----------------------------------
        this.gl.useProgram(this.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);

        this.gl.clearColor(0.0, 0.0, 0.2, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        // // set up projection matrix
        let p: mat4 = camera.getPerspectiveMat();
        this.gl.uniformMatrix4fv(this.uproj, false, p.flatten());

        this.gl.useProgram(this.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D,
            this.tableTexture, 0);
        this.gl.clearColor(0.0, 0.0, 0.2, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // set up model view matrix
        let mv: mat4 = camera.getLookAtMat();
        this.setLights(lights, mv);
        this.setVertexArrays();
        this.draw(mv, objects);
        this.disableVertexArrays();

        // ----------------------------------
        // Part 2: Spread and accumulate
        // ----------------------------------

        let pixels:Uint8Array = new Uint8Array(this.canvas.clientWidth * this.canvas.clientHeight * 4);
        this.gl.readPixels(0, 0, this.canvas.clientWidth, this.canvas.clientHeight, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, pixels);
        let table:number[] = this.spreadAndAccumulate(pixels);

        // ----------------------------------
        // Part 3: Render Geometry to texture
        // ----------------------------------

        this.gl.useProgram(this.secondPassProgram);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // disable the frame buffer to draw to screen

        //setting background color for render to screen
        this.gl.clearColor(1, 0, 0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);

        // read out of textures to set the texture uniforms for the shaders
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tableTexture);
        this.gl.uniform1i(this.uTableSampler, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBufferId);
        //send the local data over to this buffer on the graphics card.
        // this is throwing an error but it works, and if I change it to something like "new Float32Array(table)"
        //  it no longer works?? So I'm going to ignore it :)
        // @ts-ignore
        this.gl.bufferData(this.gl.ARRAY_BUFFER, table, this.gl.STATIC_DRAW);

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

    protected createSpreadTable():tableEntry[][]{
        let table:tableEntry[][] = []
        for(let i = 0; i < this.canvas.clientWidth; i++){
            table[i] = [];
            for(let j = 0; j < this.canvas.clientHeight; j++){
                table[i][j] = new tableEntry(new vec2(i, j));
            }
        }
        return table;
    }

    protected spreadAndAccumulate(pixels:Uint8Array):number[]{
        let table:tableEntry[][] = this.createSpreadTable();

        for(let i = 0; i < this.canvas.clientWidth; i++){
            for(let j = 0; j < this.canvas.clientHeight; j++){
                let base:number = i * j;
                table[i][j].color = new vec4(pixels[base], pixels[base + 1], pixels[base + 2], pixels[base + 3]);
            }
        }

        let retArray = [];

        for(let i = 0; i < this.canvas.clientWidth; i++){
            for(let j = 0; j < this.canvas.clientHeight; j++){
                retArray.push(table[i][j].flatten());
            }
        }

        return retArray;
    }

}

class tableEntry {
    color:vec4;
    position:vec2;

    constructor(position:vec2) {
        this.color = new vec4(0, 0, 0, 0);
        this.position = position;
    }

    flatten():number[]{
        let retArray = [];

        retArray.push(this.color.flatten());
        retArray.push(this.position.flatten());

        return retArray;
    }
}