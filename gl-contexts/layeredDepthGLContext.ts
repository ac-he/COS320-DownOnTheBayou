import {GLContext} from "./glContext.js";
import {flatten, initFileShaders, mat4, vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {Camera} from "../helpers/camera.js";
import {RenderObject} from "../helpers/renderObject.js";


export class LayeredDepthGLContext extends GLContext {

    private tableInTexture:WebGLTexture;
    private tableOutTexture:WebGLTexture;
    private depthOutTexture:WebGLTexture;
    private positionOutTexture:WebGLTexture;
    private fb:WebGLFramebuffer;

    private uTableSampler:WebGLUniformLocation;


    constructor(canvas:HTMLCanvasElement) {
        super(canvas);

        this.secondPassProgram = initFileShaders(this.gl, "../shaders/ldof-vertexShader.glsl",
            "../shaders/ldof-fragmentShader.glsl");
        this.gl.useProgram(this.secondPassProgram);
        this.uTableSampler = this.gl.getUniformLocation(this.secondPassProgram, "uTableSampler");

        this.gl.useProgram(this.program);
        this.makeSquareAndBuffer();

        this.gl.enable(this.gl.DEPTH_TEST);

        this.tableInTexture = this.gl.createTexture();
        this.setupTextureBuffer(this.tableInTexture);

        this.tableOutTexture = this.gl.createTexture();
        this.setupTextureBuffer(this.tableOutTexture);

        this.positionOutTexture = this.gl.createTexture();
        this.setupTextureBuffer(this.positionOutTexture)

        // set up depth texture
        this.depthOutTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthOutTexture);
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
            this.depthOutTexture, 0);

        this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0, this.gl.COLOR_ATTACHMENT1]);
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
            this.tableOutTexture, 0);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT1, this.gl.TEXTURE_2D,
            this.positionOutTexture, 0);
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

        // convert texture to pixels
        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
        let pixels:Uint8Array = new Uint8Array(this.canvas.clientWidth * this.canvas.clientHeight * 4);
        this.gl.readPixels(0, 0, this.canvas.clientWidth, this.canvas.clientHeight, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, pixels);
        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT1);
        let depthPixels:Uint8Array = new Uint8Array(this.canvas.clientWidth * this.canvas.clientHeight * 4);
        this.gl.readPixels(0, 0, this.canvas.clientWidth, this.canvas.clientHeight, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, depthPixels);

        // operate on pixels
        let table:Uint8Array = this.spreadAndAccumulate(pixels, depthPixels);

        // switch program
        this.gl.useProgram(this.secondPassProgram);
        //setting background color for render to screen
        this.gl.clearColor(1, 0, 0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // convert pixels to texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tableInTexture)
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.canvas.clientWidth, this.canvas.clientHeight,
           0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, table);
        // read out of textures to set the texture uniforms for the shaders
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(this.uTableSampler, 0);

        // ----------------------------------
        // Part 3: Render square from texture
        // ----------------------------------
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

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

    protected createSpreadTable():vec4[][]{
        let table:vec4[][] = []
        for(let i = 0; i < this.canvas.clientWidth; i++){
            table[i] = [];
            for(let j = 0; j < this.canvas.clientHeight; j++){
                table[i][j] = new vec4(0.0, 0.0, 0.0, 0.0);
            }
        }
        return table;
    }

    protected spreadAndAccumulate(pixels:Uint8Array, depthPixels:Uint8Array):Uint8Array{
        let table:vec4[][] = this.createSpreadTable();

        // PHASE 1: SPREAD
        for(let i = 0; i < this.canvas.clientWidth; i++){
            for(let j = 0; j < this.canvas.clientHeight; j++){
                // find this pixel's first index in the array
                let base:number = i * this.canvas.clientHeight * 4 + j * 4;

                // get the blur radius
                let radius:number = this.getBlurRadius(depthPixels[base+3]);
                let area:number = (radius * 2 + 1) * (radius * 2 + 1);

                // determine the color that this picture will spread to other colors
                // if it spreads to a larger area, it will appear more diluted
                let color:vec4 = new vec4(
                    pixels[base] / area,
                    pixels[base + 1] / area,
                    pixels[base + 2] / area,
                    pixels[base + 3] / area) ;

                // spread this color to the corners of its blur rectangle, if they exist
                if(i - radius >= 0 && j - radius >= 0){
                    table[i - radius][j - radius].add(color);
                }
                if(i + radius < this.canvas.clientWidth && j - radius >= 0){
                    table[i + radius][j - radius].add(color);
                }
                if(i - radius >= 0 && j + radius < this.canvas.clientHeight){
                    table[i - radius][j + radius].add(color);
                }
                if(i + radius < this.canvas.clientWidth && j + radius < this.canvas.clientHeight){
                    table[i + radius][j + radius].add(color);
                }
            }
        }

        // // PHASE 2: ACCUMULATE
        // let accumulator:vec4;
        // let retTable:vec4[][] = [];
        // for(let i = 0; i < this.canvas.clientWidth; i++){
        //     accumulator = new vec4(0, 0, 0, 0);
        //     retTable[i] = [];
        //     for(let j = 0; j < this.canvas.clientHeight; j++){
        //         accumulator.add(table[i][j]);
        //         let tableColor:vec4;
        //         if(j - 1 <= 0) {
        //             tableColor = table[i][j - 1];
        //         } else {
        //             tableColor = new vec4(0, 0, 0, 0);
        //         }
        //         //retTable[i][j] = tableColor.add(accumulator);
        //     }
        // }

        // export the table in a usable format
        let retArray:vec4[] = [];
        for(let i = 0; i < this.canvas.clientWidth; i++){
            for(let j = 0; j < this.canvas.clientHeight; j++){
                //retArray.push(retTable[i][j]);
                retArray.push(new vec4(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255));
            }
        }
        return new Uint8Array(flatten(retArray));
    }

    protected getBlurRadius(depth:number):number{ // this should have a depth parameter
        return depth;
    };

}
