"use strict"

import {vec4} from './helpers/helperfunctions.js';
import {BoatBody} from "./objects/boatBody.js";
import {Water} from "./objects/water.js";
import {BoatFan} from "./objects/boatFan.js"
import {BoatRudder} from "./objects/boatRudder.js";
import {RenderObject} from "./helpers/renderObject.js";
import {BoatLight} from "./objects/boatLight.js";
import {Camera} from "./helpers/camera.js";
import {FreeRoam} from "./cameras/freeRoam.js";
import {Overhead} from "./cameras/overhead.js";
import {Chase} from "./cameras/chase.js";
import {SearchLightCamera} from "./cameras/searchLight.js";
import {SceneryManager} from "./helpers/sceneryManager.js";
import {SpotLight} from "./lights/spotLight.js";
import {Light} from "./helpers/light.js";
import {NavigationLight} from "./lights/navigationLight.js";
import {HazardLight} from "./lights/hazardLight.js";
import {Coin} from "./objects/coin.js";
import {LayeredDepthGLContext} from "./gl-contexts/layeredDepthGLContext.js";
import {AccumulationDepthGLContext} from "./gl-contexts/accumulationDepthGLContext.js";
import {GLContext} from "./gl-contexts/glContext.js";

// webGL contexts
let regularGLContext: GLContext;
let ldofGLContext: LayeredDepthGLContext;
let abGLContext: AccumulationDepthGLContext;

//html elements
let cameraButtons: HTMLButtonElement[];
let cameraControlFeedback: HTMLDivElement;
let coinModeFeedback: HTMLDivElement;
let apertureSlider: HTMLInputElement;
let focalDepthSlider: HTMLInputElement;
let apertureFeedback: HTMLDivElement;
let focalDepthFeedback:HTMLDivElement;

let spotLight: SpotLight;
let leftNavLight: NavigationLight;
let rightNavLight: NavigationLight;
let backNavLight: NavigationLight;
let hazardLightA: HazardLight;
let hazardLightB: HazardLight;
let lights: Light[];

// to store all objects in the scene
let boat: BoatBody;
let water: Water;
let fan: BoatFan;
let rudder1: BoatRudder;
let rudder2: BoatRudder;
let rudder3: BoatRudder;
let light: BoatLight;
let coin: Coin;
// these will also be added to a list for easy iteration over
let objects: RenderObject[];

// to track the state of the boat as it moves
let moving: number; // [-1, 0, 1] used as a multiplier for boat movement
let turning: number; // [-1, 0, 1] used as a multiplier for boat rotation
let lightMoving: number; // [-1, 0, 1] used as a multiplier for light movement

// to keep track of the camera
let camera: Camera;
let frCamera: FreeRoam;
let aspectRatio: number;

// keep track of ambient light level
let lightLevel:number;

// coin mode
let coinCount: number;
let coinMode: boolean;

// to keep track of the page mode
let accumulationMode:boolean;
let layeredDepthMode:boolean;

// initial setup
window.onload = function init() {
    // get mode/what html is being viewed by checking the page's name
    accumulationMode = !!window.location.pathname.match("Accumulation");
    if(!accumulationMode){
        layeredDepthMode = !!window.location.pathname.match("Layered");
    }

    // set up canvas
    if(accumulationMode){
        let canvas = document.getElementById("gl-canvas-ab") as HTMLCanvasElement;
        abGLContext = new AccumulationDepthGLContext(canvas);
        canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
        regularGLContext = new GLContext(canvas);
        if (!regularGLContext || !abGLContext) {
            alert("WebGL isn't available");
        }
    } else if (layeredDepthMode) {
        let canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
        regularGLContext = new GLContext(canvas);
        canvas = document.getElementById("gl-canvas-ldof") as HTMLCanvasElement;
        ldofGLContext = new LayeredDepthGLContext(canvas);
        if (!regularGLContext || !ldofGLContext) {
            alert("WebGL isn't available");
        }
    } else {
        let canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
        regularGLContext = new GLContext(canvas);
        if (!regularGLContext) {
            alert("WebGL isn't available");
        }
    }

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
    coinModeFeedback = document.getElementById("coin-mode-feedback") as HTMLDivElement;

    if(accumulationMode){
        apertureSlider = document.getElementById("aperture") as HTMLInputElement;
        apertureSlider.addEventListener("change", handleDepthEffectChange);
        focalDepthSlider = document.getElementById("focal-distance") as HTMLInputElement;
        focalDepthSlider.addEventListener("change", handleDepthEffectChange);

        apertureFeedback = document.getElementById("aperture-feedback") as HTMLDivElement;
        focalDepthFeedback = document.getElementById("focal-distance-feedback") as HTMLDivElement;
    }

    // the boat is still to begin with
    moving = 0;
    turning = 0;
    lightMoving = 0;

    // basic light
    lightLevel = 0.35;
    coinMode = false;

    // set up initial array of render objects
    water = new Water(0, 0);
    boat = new BoatBody(water);
    fan = new BoatFan(boat);
    rudder1 = new BoatRudder(boat, 0.3);
    rudder2 = new BoatRudder(boat, 0);
    rudder3 = new BoatRudder(boat, -0.3);
    light = new BoatLight(boat);
    coin = new Coin(water);

    // put these objects into a list for easy iteration
    objects = [
        water,
        boat,
        fan,
        rudder1,
        rudder2,
        rudder3,
        light,
        coin,
    ];
    let sm = new SceneryManager(water);
    objects.push(...sm.getScenery());

    // set up lights
    spotLight = new SpotLight(light);
    leftNavLight = new NavigationLight(boat, new vec4(0, 0.5, 0, 1), new vec4(-1, 0, 0, 0));
    rightNavLight = new NavigationLight(boat, new vec4(0.5, 0, 0, 1), new vec4(1, 0, 0, 0));
    backNavLight = new NavigationLight(boat, new vec4(0.5, 0.5, 0.5, 1), new vec4(0, 0, 1, 0));
    hazardLightA = new HazardLight(boat, new vec4(-1, 0, 0, 0));
    hazardLightB = new HazardLight(boat, new vec4(1, 0, 0, 0));

    // put all lights into a list for easy iteration
    lights = [
        spotLight,
        leftNavLight,
        rightNavLight,
        backNavLight,
        hazardLightA,
        hazardLightB
    ]

    // create all the objects
    makeObjectsAndBuffer();

    if(accumulationMode){
        if(regularGLContext.getAspectRatio() != abGLContext.getAspectRatio()){
            alert("GL Contexts have different aspect ratios.");
        } else {
            aspectRatio = regularGLContext.getAspectRatio();
        }
    } else if(layeredDepthMode){
        if(regularGLContext.getAspectRatio() != ldofGLContext.getAspectRatio()){
            alert("GL Contexts have different aspect ratios.");
        } else {
            aspectRatio = regularGLContext.getAspectRatio();
        }
    } else {
        aspectRatio = regularGLContext.getAspectRatio();
    }
    frCamera = new FreeRoam(boat, aspectRatio);
    setFreeRoamCamera();

    // toggling coin mode on and off ensures that everything coin mode impacts (html, lighting, etc) gets set up properly
    toggleCoinMode();
    toggleCoinMode();

    if(accumulationMode){
        handleDepthEffectChange();
    }

    window.setInterval(update, 16); // targeting 60fps
};

function keydownHandler(event) {
    switch (event.key) {
        case "ArrowLeft":
            turning = 1.2;
            event.preventDefault();
            break;
        case "ArrowRight":
            turning = -1.2;
            event.preventDefault();
            break;
        case "ArrowDown":
            moving = -1.2;
            event.preventDefault();
            break;
        case "ArrowUp":
            moving = 1.2;
            event.preventDefault();
            break;
        case "a":
            lightMoving = 1;
            break;
        case "b":
            if (!coinMode) {
                if (lightLevel > 1) {
                    lightLevel = 0;
                }
                lightLevel += 0.05;
            }
            if(accumulationMode){
                abGLContext.setAmbientLightAmount(new vec4(lightLevel, lightLevel, lightLevel, 1.0));
                regularGLContext.setAmbientLightAmount(new vec4(lightLevel, lightLevel, lightLevel, 1.0));
            } else if(accumulationMode){
                regularGLContext.setAmbientLightAmount(new vec4(lightLevel, lightLevel, lightLevel, 1.0));
                ldofGLContext.setAmbientLightAmount(new vec4(lightLevel, lightLevel, lightLevel, 1.0));
            }else {
                regularGLContext.setAmbientLightAmount(new vec4(lightLevel, lightLevel, lightLevel, 1.0));
            }
            break;
        case "c":
            toggleCoinMode();
            break;
        case "d":
            lightMoving = -1;
            break;

        case "e":
            if (camera === frCamera) {
                frCamera.changeDollyZoomBy(2);
            }
            break;
        case "f":
            if (camera === frCamera) {
                frCamera.toggleBoatCentered();
            }
            break;
        case "h":
            if (!coinMode) {
                hazardLightA.toggleOnOff();
                hazardLightB.toggleOnOff();
            }
            break;
        case "n":
            if (!coinMode) {
                leftNavLight.toggleOnOff();
                rightNavLight.toggleOnOff();
                backNavLight.toggleOnOff();
            }
            break;
        case "q":
            if (camera === frCamera) {
                frCamera.changeDollyZoomBy(-2);
            }
            break;
        case "r":
            if (camera === frCamera) {
                frCamera.reset();
            }
            break;
        case "s":
            spotLight.toggleOnOff();
            break;
        case "x":
            if (camera === frCamera) {
                frCamera.changeLensZoomBy(-5);
            }
            break;
        case "z":
            if (camera === frCamera) {
                frCamera.changeLensZoomBy(5);
            }
            break;
        case "1":
            if (!coinMode) {
                setFreeRoamCamera();
            }
            break;
        case "2":
            if (!coinMode) {
                setOverheadCamera();
            }
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
    switch (event.key) {
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

function toggleCoinMode(){
    coinMode = !coinMode;

    let newLightLevel:number[];
    if (coinMode) {
        setSearchLightCamera();
        coin.move();
        coinCount = 0;
        coinModeFeedback.innerText = "Coins: " + coinCount;
        lights.forEach((light: Light) => {
            light.isOn = false;
        });
        spotLight.isOn = true;
        newLightLevel = [0.1, 0.1, 0.1, 1.0];
    } else {
        setFreeRoamCamera();
        coin.hide();
        newLightLevel = [lightLevel, lightLevel, lightLevel, 1];
    }

    if(accumulationMode){
        regularGLContext.setAmbientLightAmount(newLightLevel);
        abGLContext.setAmbientLightAmount(newLightLevel);
    } else if (layeredDepthMode) {
        regularGLContext.setAmbientLightAmount(newLightLevel);
        ldofGLContext.setAmbientLightAmount(newLightLevel);
    } else {
        regularGLContext.setAmbientLightAmount(newLightLevel);
    }
}

function setFreeRoamCamera() {
    cameraButtons.forEach((button: HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[0].className = "selected";
    cameraControlFeedback.innerText =
        "X -- Zoom In (lens)\n" +
        "Z -- Zoom Out (lens)\n" +
        "Q -- Zoom In (dolly)\n" +
        "E -- Zoom Out (dolly)\n" +
        "F -- Toggle Center\n" +
        "R -- Reset";
    camera = frCamera;
}

function setOverheadCamera() {
    cameraButtons.forEach((button: HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[1].className = "selected";
    cameraControlFeedback.innerText = "";
    camera = new Overhead(boat, aspectRatio);
}

function setChaseCamera() {
    cameraButtons.forEach((button: HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[2].className = "selected";
    cameraControlFeedback.innerText = "";
    camera = new Chase(boat, aspectRatio);
}

function setSearchLightCamera() {
    cameraButtons.forEach((button: HTMLButtonElement) => {
        button.className = "";
    });
    cameraButtons[3].className = "selected";
    cameraControlFeedback.innerText = "";
    camera = new SearchLightCamera(light, aspectRatio);
}

function handleDepthEffectChange(){
    abGLContext.setFocalDistance(parseInt(focalDepthSlider.value));
    abGLContext.setAperture(parseInt(apertureSlider.value));

    apertureFeedback.innerText = abGLContext.aperture.toString();
    focalDepthFeedback.innerText = abGLContext.focalDistance.toString();

    requestAnimationFrame(render);
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

    hazardLightA.rotate();
    hazardLightB.rotate();

    if(coinMode){
    let distanceToCoin = Math.sqrt((boat.xPos - coin.xPos) ** 2 + (boat.zPos - coin.zPos) ** 2);
        if (distanceToCoin < 1) {
            coin.move();
            coinCount++;
            coinModeFeedback.innerText = "Coins: " + coinCount;
        }
    }

    coin.rotateBy(2);

    requestAnimationFrame(render);
}

function render() {
    if(accumulationMode){
        abGLContext.render(lights, camera, objects);
        regularGLContext.render(lights, camera, objects);
    } else if (layeredDepthMode) {
        regularGLContext.render(lights, camera, objects);
        ldofGLContext.render(lights, camera, objects);
    } else {
        regularGLContext.render(lights, camera, objects);
    }
}

function makeObjectsAndBuffer() {
    //Make all objects and send over to the graphics card
    let allPoints: number[] = [];
    let curIndex: number = 0;
    objects.forEach((rOb: RenderObject) => {
        rOb.bufferIndex = curIndex;
        let numPoints: number = rOb.getNumPoints();
        let positions: vec4[] = rOb.getObjectPositions();
        let colors: vec4[] = rOb.getObjectColors();
        let normals: vec4[] = rOb.getObjectNormals();

        for (let i: number = 0; i < numPoints; i++) {
            allPoints.push(...positions[i].flatten());
            allPoints.push(...colors[i].flatten());
            allPoints.push(...normals[i].flatten());
            allPoints.push(...rOb.getSpecularColor().flatten());
            allPoints.push(rOb.getSpecularExponent());
        }
        curIndex += numPoints;
    })

    //bind and buffer all points
    if(accumulationMode){
        abGLContext.bindAndBufferPoints(allPoints);
        regularGLContext.bindAndBufferPoints(allPoints);
    } else if (layeredDepthMode) {
        regularGLContext.bindAndBufferPoints(allPoints);
        ldofGLContext.bindAndBufferPoints(allPoints);
    } else {
        regularGLContext.bindAndBufferPoints(allPoints);
    }

}