"use strict"

// webGL objects

import {
    initShaders,
    vec4,
    mat4,
    flatten,
    perspective,
    translate,
    lookAt,
    rotateX,
    rotateY,
    rotateZ,
} from './helperfunctions.js';
import {BoatBody} from "./objects/BoatBody.js";
import {Water} from "./objects/Water.js";
import {BoatFan} from "./objects/BoatFan.js"
import {BoatRudders} from "./objects/BoatRudders.js";
import {RenderObject} from "./RenderObject.js";

let gl:WebGLRenderingContext;
let canvas:HTMLCanvasElement;
let program:WebGLProgram;
let bufferId:WebGLBuffer;

// shader variables
let umv:WebGLUniformLocation; // model_view uniform
let uproj:WebGLUniformLocation; // projection uniform
let vPosition:GLint; // vPosition vertex
let vColor:GLint; // vColor vertex

// to store all objects in the scene
let boat:BoatBody;
let water:Water;
let fan:BoatFan;
let rudder1:BoatRudders;
let rudder2:BoatRudders;
let rudder3:BoatRudders;
let objects:RenderObject[];

// to track input
let moving:number;
let turning:number;


// initial setup
window.onload = function init() {
    // set up canvas
    canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
    gl = canvas.getContext('webgl2') as WebGLRenderingContext;
    if (!gl) {
        alert("WebGL isn't available");
    }

    // compile shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program); //and we want to use that program for our rendering

    // set up uniform views
    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");

    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);

    moving = 0;
    turning = 0;

    // set up initial array of render objects
    water = new Water();
    boat = new BoatBody(water);
    fan = new BoatFan(boat);
    rudder1 = new BoatRudders(boat, 0.3);
    rudder2 = new BoatRudders(boat, 0);
    rudder3 = new BoatRudders(boat, -0.3);

    objects = [
        water,
        boat,
        fan,
        rudder1,
        rudder2,
        rudder3,
    ];
    makeObjectsAndBuffer();

    // set up the viewport
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // set up background
    gl.clearColor(0, 0.5, 0,1);

    // configure so that object overlap corresponds to depth
    gl.enable(gl.DEPTH_TEST);

    window.setInterval(update, 16); // targeting 60fps
};

function keydownHandler(event) {
    switch(event.key) {
        case "ArrowLeft":
            turning = 1;
            break;
        case "ArrowRight":
            turning = -1;
            break;
        case "ArrowDown":
            moving = -1;
            break;
        case "ArrowUp":
            moving = 1;
            break;
    }

    requestAnimationFrame(render);//and now we need a new frame since we made a change
}

function keyupHandler(event) {
    switch(event.key) {
        case "ArrowLeft":
        case "ArrowRight":
            turning = 0;
            break;
        case "ArrowUp":
        case "ArrowDown":
            moving = 0;
            break;
    }

    requestAnimationFrame(render);//and now we need a new frame since we made a change
}

function update() {
    boat.moveBy(moving / 8);
    fan.spinBy(moving * 15);

    boat.rotateBy(turning);
    rudder1.direction = turning * 30
    rudder2.direction = turning * 30
    rudder3.direction = turning * 30

    requestAnimationFrame(render);
}

function render() {
    // clear out old color and depth info
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set up projection matrix
    let p:mat4 = perspective(45.0, canvas.clientWidth / canvas.clientHeight, 1, 100);
    gl.uniformMatrix4fv(uproj, false, p.flatten());

    // set up model view matrix
    let mv:mat4 = lookAt(new vec4(0, 10, 20, 1), new vec4(0, 0, 0, 1),
        new vec4(0, 1, 0, 0));
    mv = mv.mult(translate(0, 0, 0));
    let commonMat:mat4 = mv;

    gl.uniformMatrix4fv(umv, false, mv.flatten());

    // bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // send over geometry
    let numTris = 0;
    objects.forEach((rOb:RenderObject) => {
        numTris += rOb.getNumTris();

        mv = commonMat;
        let transforms = rOb.getTransformsSequence();
        transforms.forEach((transform) => {
            mv = mv.mult(transform);
        });

        gl.uniformMatrix4fv(umv, false, mv.flatten());
        gl.drawArrays(gl.TRIANGLES, rOb.bufferIndex, rOb.getNumTris()); // draw the object
    });
}

//Make all objects and send over to the graphics card
function makeObjectsAndBuffer(){
    let allPoints:vec4[] = [];
    let curIndex = 0;
    objects.forEach((rOb:RenderObject) => {
        rOb.bufferIndex = curIndex;
        allPoints.push(...rOb.getObjectTris());
        console.log("this object takes up " + curIndex + " + " + rOb.getNumTris() );
        curIndex += rOb.getNumTris();
    })

    //we need some graphics memory for this information
    bufferId = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(allPoints), gl.STATIC_DRAW);

    // position            color
    //  x   y   z     w       r    g     b    a
    // 0-3 4-7 8-11 12-15  16-19 20-23 24-27 28-31

    // vPosition
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    // vColor
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}