import {vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {BoatLight} from "../objects/boatLight.js";

export class SpotLight extends Light{

    constructor(boatLight:BoatLight) {
        super(
            boatLight, // object
            new vec4(1, 1, 1, 1), // color (white)
            13, // radiusAngle
            new vec4(0, 0, -0.19, 1), // position (shifted to the very back of the spotlight)
            new vec4(0, 0, -1, 0) // direction (towards the front of the boat)
        );
    }

}