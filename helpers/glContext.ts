import {initFileShaders, mat4, vec4} from "./helperfunctions.js";
import {RenderObject} from "./renderObject.js";


export abstract class GLContext {

    protected canvas:HTMLCanvasElement;
    protected gl:WebGLRenderingContext;
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

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl2') as WebGLRenderingContext;
        this.program = this.getFileShaders();
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

    abstract getFileShaders():WebGLProgram;

    getAspectRatio():number{
        return this.aspectRatio;
    }

    clear():void{
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    setUProj(p:mat4):void{
        this.gl.uniformMatrix4fv(this.uproj, false, p.flatten());
    }

    setUMV(mv:mat4):void{
        this.gl.uniformMatrix4fv(this.umv, false, mv.flatten());
    }

    setLights(lightList:number[], lightCount:number):void{
        this.gl.uniform1fv(this.uLights, lightList);
        this.gl.uniform1i(this.uLightCount, lightCount);
    }

    bindBuffer():void{
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
    }

    setAmbientLight(level:vec4):void{
        this.gl.uniform4fv(this.uAmbient, level);
    }

    drawTriangles(renderObject:RenderObject):void{
        this.gl.drawArrays(this.gl.TRIANGLES, renderObject.bufferIndex, renderObject.getNumPoints());
    }

    bindAndBufferPoints(points:number[]):void{
        this.bufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(points), this.gl.STATIC_DRAW);

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
}