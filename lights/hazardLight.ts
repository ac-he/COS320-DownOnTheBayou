import {vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {BoatBody} from "../objects/boatBody.js";

export class HazardLight extends Light{

    constructor(boatBody:BoatBody, direction:vec4) {
        super(
            boatBody, // object
            new vec4(0.8, 0.4, 0, 1), // color -- orange
            75, // radiusAngle
            new vec4(0, 1, 0, 1), // position (above the water, centered over the boat)
            direction // direction
        );
    }

    // rotate the hazard lights
    rotate():void{
        this.rotation += 1;
    }

}