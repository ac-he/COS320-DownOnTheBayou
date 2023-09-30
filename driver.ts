"use strict"

import {initShaders, vec4, mat4, flatten, translate} from './helpers/helperfunctions.js';
import {BoatBody} from "./objects/boatBody.js";
import {Water} from "./objects/water.js";
import {BoatFan} from "./objects/boatFan.js"
import {BoatRudder} from "./objects/boatRudder.js";
import {RenderObject} from "./helpers/renderObject.js";
import {BoatLight} from "./objects/boatLight.js";
import {Tree} from "./objects/tree.js";
import {Camera} from "./helpers/camera.js";
import {FreeRoam} from "./cameras/freeRoam.js";
import {Overhead} from "./cameras/overhead.js";
import {Chase} from "./cameras/chase.js";
import {SearchLightCamera} from "./cameras/searchLight.js";

// webGL objects
let gl:WebGLRenderingContext;
let canvas:HTMLCanvasElement;
let program:WebGLProgram;
let bufferId:WebGLBuffer;
let cameraButtons:HTMLButtonElement[];
let cameraControlFeedback:HTMLDivElement;

// shader variables
let umv:WebGLUniformLocation; // model_view uniform
let uproj:WebGLUniformLocation; // projection uniform
let vPosition:GLint; // vPosition vertex
let vColor:GLint; // vColor vertex

// to store all objects in the scene
let boat:BoatBody;
let water:Water;
let fan:BoatFan;
let rudder1:BoatRudder;
let rudder2:BoatRudder;
let rudder3:BoatRudder;
let light:BoatLight;
// these will also be added to a list for easy iteration over
let objects:RenderObject[];

// to track the state of the boat as it moves
let moving:number; // [-1, 0, 1] used as a multiplier for boat movement
let turning:number; // [-1, 0, 1] used as a multiplier for boat rotation
let lightMoving:number; // [-1, 0, 1] used as a multiplier for light movement

// to keep track of the camera
let camera:Camera;
let frCamera:FreeRoam;
let aspectRatio:number;


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

    // create event listeners to deal with keyboard input
    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);

    // set up camera control buttons
    cameraButtons = [
        document.getElementById("free-roam") as HTMLButtonElement,
        document.getElementById("overhead") as HTMLButtonElement,
        document.getElementById("chase") as HTMLButtonElement,
        document.getElementById("search-light") as HTMLButtonElement,
    ];
    cameraButtons[0].addEventListener("click", setFreeRoamCamera);
    cameraButtons[1].addEventListener("click", setOverheadCamera);
    cameraButtons[2].addEventListener("click", setChaseCamera);
    cameraButtons[3].addEventListener("click", setSearchLightCamera);

    cameraControlFeedback = document.getElementById("camera-control-feedback") as HTMLDivElement;


    // the boat is still to begin with
    moving = 0;
    turning = 0;
    lightMoving = 0;

    // set up initial array of render objects
    water = new Water();
    boat = new BoatBody(water);
    fan = new BoatFan(boat);
    rudder1 = new BoatRudder(boat, 0.3);
    rudder2 = new BoatRudder(boat, 0);
    rudder3 = new BoatRudder(boat, -0.3);
    light = new BoatLight(boat);

    // put these objects into a list for easy iteration
    objects = [
        water,
        boat,
        fan,
        rudder1,
        rudder2,
        rudder3,
        light,
        new Tree(water, 0, -water.size, water.size),
        new Tree(water, 0, water.size, water.size),
        new Tree(water, 0, -water.size, -water.size),
        new Tree(water, 0, water.size, -water.size),
        new Tree(water, 0, -water.size, 0),
        new Tree(water, 0, water.size, 0),
        new Tree(water, 0,0, -water.size),
        new Tree(water, 0, 0, water.size)
    ];

    // create all the objects
    makeObjectsAndBuffer();

    // set up the viewport
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // create the initial camera
    aspectRatio = canvas.clientWidth / canvas.clientHeight
    frCamera = new FreeRoam(boat, aspectRatio);
    setFreeRoamCamera();

    // set up background
    gl.clearColor(67/255, 110/255, 92/255,1);

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
        case "a":
            lightMoving = 1;
            break;
        case "d":
            lightMoving = -1;
            break;
        case "e":
            if(camera === frCamera){
                frCamera.changeDollyZoomBy(2);
            }
            break;
        case "f":
            if(camera === frCamera){
                frCamera.toggleBoatCentered();
            }
            break;
        case "q":
            if(camera === frCamera){
                frCamera.changeDollyZoomBy(-2);
            }
            break;
        case "r":
            if(camera === frCamera) {
                frCamera.reset();
            }
            break;
        case "x":
            if(camera === frCamera){
                frCamera.changeLensZoomBy(-5);
            }
            break;
        case "y":
            if(camera === frCamera){
                frCamera.changeLensZoomBy(5);
            }
            break;
        case "1":
            setFreeRoamCamera();
            break;
        case "2":
            setOverheadCamera();
            break;
        case "3":
            setChaseCamera();
            break;
        case "4":
            setSearchLightCamera();
            break;
    }
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
        case "a":
        case "d":
            lightMoving = 0;
            break;
    }
}

function setFreeRoamCamera(){
    cameraButtons.forEach((button:HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[0].className = "selected";
    cameraControlFeedback.innerText =
        "X -- Zoom In (lens)\n" +
        "Y -- Zoom Out (lens)\n" +
        "Q -- Zoom In (dolly)\n" +
        "E -- Zoom Out (dolly)\n" +
        "F -- Toggle Center\n" +
        "R -- Reset";
    camera = frCamera;
}

function setOverheadCamera(){
    cameraButtons.forEach((button:HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[1].className = "selected";
    cameraControlFeedback.innerText = "";
    camera = new Overhead(boat, aspectRatio);
}

function setChaseCamera(){
    cameraButtons.forEach((button:HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[2].className = "selected";
    cameraControlFeedback.innerText = "";
    camera = new Chase(boat, aspectRatio);
}

function setSearchLightCamera(){
    cameraButtons.forEach((button:HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[3].className = "selected";
    cameraControlFeedback.innerText = "";
    camera = new SearchLightCamera(light, aspectRatio);
}

function update() {
    // move the boat
    boat.moveBy(moving / 8);
    fan.rotateBy(moving * 15);

    // spin the boat
    boat.rotateBy(turning);
    rudder1.direction = turning * 30;
    rudder2.direction = turning * 30;
    rudder3.direction = turning * 30;

    // rotate the light
    light.rotateBy(lightMoving);

    requestAnimationFrame(render);
}

function render() {
    // clear out old color and depth info
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set up projection matrix
    let p:mat4 = camera.getPerspectiveMat();
    gl.uniformMatrix4fv(uproj, false, p.flatten());

    // set up model view matrix
    let mv:mat4 = camera.getLookAtMat();
    mv = mv.mult(translate(0, 0, 0));
    let commonMat:mat4 = mv;

    gl.uniformMatrix4fv(umv, false, mv.flatten());

    // bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // send over triangles, one object at a time
    objects.forEach((rOb:RenderObject) => {
        // reset the transformation matrix
        mv = commonMat;

        // apply every transformation associated with this object
        let transforms = rOb.getTransformsSequence();
        transforms.forEach((transform) => {
            mv = mv.mult(transform);
        });

        // draw the object
        gl.uniformMatrix4fv(umv, false, mv.flatten());
        gl.drawArrays(gl.TRIANGLES, rOb.bufferIndex, rOb.getNumTris());
    });
}

function makeObjectsAndBuffer(){
    //Make all objects and send over to the graphics card
    let allPoints:vec4[] = [];
    let curIndex = 0;
    objects.forEach((rOb:RenderObject) => {
        rOb.bufferIndex = curIndex;
        allPoints.push(...rOb.getObjectTris());
        curIndex += rOb.getNumTris();
    })

    //bind and buffer all points
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
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