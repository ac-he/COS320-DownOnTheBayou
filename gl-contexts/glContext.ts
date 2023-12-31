import {flatten, initFileShaders, mat4, translate, vec2, vec4} from "../helpers/helperfunctions.js";
import {RenderObject} from "../helpers/renderObject.js";
import {Light} from "../helpers/light.js";
import {Camera} from "../helpers/camera.js";


export class GLContext {

    protected canvas:HTMLCanvasElement;
    protected gl:WebGL2RenderingContext;
    protected program:WebGLProgram;
    protected bufferId:WebGLBuffer;

    protected aspectRatio:number;

    // shader variables
    protected umv: WebGLUniformLocation; // model_view uniform
    protected uproj: WebGLUniformLocation; // projection uniform
    protected vPosition: GLint; // vPosition vector
    protected vColor: GLint; // vColor vector
    protected vNormal: GLint; // vNormal vector
    protected vSpecular: GLint;
    protected vSpecularExp: GLint;
    protected uAmbient: WebGLUniformLocation;

    protected uLights: WebGLUniformLocation;
    protected uLightCount: WebGLUniformLocation;

    protected squareBufferId:WebGLBuffer;
    protected vPositionSquare:GLint;
    protected vTexCoord:GLint;

    protected secondPassProgram:WebGLProgram;

    public ambientLightLevel:number[];

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
        this.program = initFileShaders(this.gl, "../shaders/vertexShader.glsl",
            "../shaders/fragmentShader.glsl");
        this.gl.useProgram(this.program);

        // set up uniform views
        this.umv = this.gl.getUniformLocation(this.program, "uModelView");
        this.uproj = this.gl.getUniformLocation(this.program, "uProjection");
        this.uAmbient = this.gl.getUniformLocation(this.program, "uAmbientLight");
        this.uLights = this.gl.getUniformLocation(this.program, "uLightList");
        this.uLightCount = this.gl.getUniformLocation(this.program, "uLightCount");

        // set up the viewport
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        // create the initial camera
        this.aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight

        // set up background
        this.gl.clearColor(0, 0, 0.2, 1);

        // configure so that object overlap corresponds to depth
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    setAmbientLightAmount(level:number[]):void{
        this.ambientLightLevel = level;
    }

    getAspectRatio():number{
        return this.aspectRatio;
    }

    bindAndBufferPoints(points:number[]):void{
        this.gl.useProgram(this.program);

        this.bufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(points), this.gl.STATIC_DRAW);

        this.setVertexArrays();
    }

    protected setVertexArrays(){

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        // position            color                    normal
        //  x   y   z     w      r     g     b     a      x     y     z     w
        // 0-3 4-7 8-11 12-15  16-19 20-23 24-27 28-31  32-35 36-39 40-43 44-47
        // specularColor             specularExponent
        //   r     g     b     a      r
        // 48-51 52-55 56-59 60-63  64-67

        // vPosition
        this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 68, 0);
        this.gl.enableVertexAttribArray(this.vPosition);

        // vColor
        this.vColor = this.gl.getAttribLocation(this.program, "vColor");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 68, 16);
        this.gl.enableVertexAttribArray(this.vColor);

        // vNormal
        this.vNormal = this.gl.getAttribLocation(this.program, "vNormal");
        this.gl.vertexAttribPointer(this.vNormal, 4, this.gl.FLOAT, false, 68, 32);
        this.gl.enableVertexAttribArray(this.vNormal);

        // vSpecular
        this.vSpecular = this.gl.getAttribLocation(this.program, "vSpecularColor");
        this.gl.vertexAttribPointer(this.vSpecular, 4, this.gl.FLOAT, false, 68, 48);
        this.gl.enableVertexAttribArray(this.vSpecular);

        // vSpecularExp
        this.vSpecularExp = this.gl.getAttribLocation(this.program, "vSpecularExponent");
        this.gl.vertexAttribPointer(this.vSpecularExp, 4, this.gl.FLOAT, false, 68, 64);
        this.gl.enableVertexAttribArray(this.vSpecularExp);
    }

    protected disableVertexArrays(){
        // disable all after use
        this.gl.disableVertexAttribArray(this.vPosition);
        this.gl.disableVertexAttribArray(this.vColor);
        this.gl.disableVertexAttribArray(this.vNormal);
        this.gl.disableVertexAttribArray(this.vSpecular);
        this.gl.disableVertexAttribArray(this.vSpecularExp);
    }

    // parameters = Lights, camera, action!
    render(lights:Light[], camera:Camera, objects:RenderObject[]):void{
        // set up projection matrix
        let p: mat4 = camera.getPerspectiveMat();

        this.clearAndSetPerspective(p);

        // set up model view matrix
        let mv: mat4 = camera.getLookAtMat();
        mv = mv.mult(translate(0, 0, 0));
        let commonMat: mat4 = mv;

        this.setLights(lights, mv);
        this.draw(commonMat, objects);

    }

    protected clearAndSetPerspective(p:mat4):void{
        this.gl.clearColor(0, 0, 0.2, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.uniformMatrix4fv(this.uproj, false, p.flatten());
    }

    protected setLights(lights:Light[], mv:mat4):void{
        let lightList:number[] = []
        let lightCount:number = 0;
        lights.forEach((light: Light) => {
            if (light.isOn) {
                lightList.push(...light.getLightData(mv));
                lightCount++;
            }
        });
        this.gl.uniform1fv(this.uLights, lightList);
        this.gl.uniform1i(this.uLightCount, lightCount);
        this.gl.uniform4fv(this.uAmbient, new Float32Array(this.ambientLightLevel));
    }

    protected draw(commonMat:mat4, objects:RenderObject[]):void{

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);

        let mv = commonMat
        // send over triangles, one object at a time
        objects.forEach((rOb: RenderObject) => {
            // reset the transformation matrix
            mv = commonMat;

            // apply every transformation associated with this object
            let transforms = rOb.getTransformsSequence();
            transforms.forEach((transform) => {
                mv = mv.mult(transform);
            });

            // draw the object
            this.gl.uniformMatrix4fv(this.umv, false, mv.flatten());

            this.gl.drawArrays(this.gl.TRIANGLES, rOb.bufferIndex, rOb.getNumPoints());
        });
    }

    protected setupTextureBuffer(tex:WebGLTexture){
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.canvas.width, this.canvas.height, 0,
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, null); //null data for now
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }

    protected makeSquareAndBuffer(){
        let squarePoints:any[] = []; //empty array

        //create 4 vertices and add them to the array
        //fill the whole screen: If we plan to use the default (aka identity)
        //orthographic projection matrix, then the screen will go from -1 to 1
        //in GL coordinates
        squarePoints.push(new vec4(-1, -1, 0, 1));
        squarePoints.push(new vec2(0,0)); //texture coordinates, bottom left
        squarePoints.push(new vec4(1, -1, 0, 1));
        squarePoints.push(new vec2(1,0)); //texture coordinates, bottom right
        squarePoints.push(new vec4(1, 1, 0, 1));
        squarePoints.push(new vec2(1,1)); //texture coordinates, top right
        squarePoints.push(new vec4(-1, 1, 0, 1));
        squarePoints.push(new vec2(0,1)); //texture coordinates, top left

        //we need some graphics memory for this information
        this.squareBufferId = this.gl.createBuffer();
        //tell WebGL that the buffer we just created is the one we want to work with right now
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBufferId);
        //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(squarePoints), this.gl.STATIC_DRAW);

        // use second pass program
        this.gl.useProgram(this.secondPassProgram);

        // set vposition
        this.vPositionSquare = this.gl.getAttribLocation(this.secondPassProgram, "vPosition");
        this.gl.vertexAttribPointer(this.vPositionSquare, 4, this.gl.FLOAT, false, 24, 0);
        this.gl.enableVertexAttribArray(this.vPositionSquare);

        // set vtexcoord
        this.vTexCoord = this.gl.getAttribLocation(this.secondPassProgram, "vTexCoord");
        this.gl.vertexAttribPointer(this.vTexCoord, 2, this.gl.FLOAT, false, 24, 16); //stride is 24 bytes total for position, texcoord
        this.gl.enableVertexAttribArray(this.vTexCoord);

        // disable after use
        this.gl.disableVertexAttribArray(this.vPositionSquare);
        this.gl.disableVertexAttribArray(this.vTexCoord);
    }
}