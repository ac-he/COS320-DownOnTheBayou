import {vec4} from "../helpers/helperfunctions.js";
import {Light} from "../helpers/light.js";
import {BoatBody} from "../objects/boatBody.js";

export class NavigationLight extends Light{

    constructor(boatBody:BoatBody, color:vec4, direction:vec4) {
        super(
            boatBody,
            color,
            39,
            new vec4(0, 0.8, 0, 1),
            direction
        );

        // the light facing the back of the boat intersects strangely with the fan and rudders without this offset
        // due to the difference in boat width and length
        if(direction[2] == 1){
            this.position[2] = -0.9;
        }
    }

}