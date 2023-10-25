import {mat4, vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {BoatLight} from "../objects/boatLight";

export class SpotLight extends Light{

    constructor(boatLight:BoatLight) {
        super(
            boatLight,
            new vec4(1, 1, 1, 1),
            13,
            new vec4(0, 0, -0.19, 1),
            new vec4(0, 0, -1, 0)
        );
    }

}