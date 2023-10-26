import {vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {BoatBody} from "../objects/boatBody.js";

export class HazardLight extends Light{

    constructor(boatBody:BoatBody, direction:vec4) {
        super(
            boatBody,
            new vec4(0.8, 0.4, 0, 1),
            75,
            new vec4(0, 1, 0, 1),
            direction
        );
    }

    rotate():void{
        this.rotation += 1;
    }

}