import {RenderObject} from "./renderObject.js";
import {Tree} from "../objects/tree.js";
import {MarshPlants} from "../objects/marshPlants.js";
import {Water} from "../objects/water.js";

export class SceneryManager{

    water:Water;
    constructor(water:Water) {
        this.water = water;
    }

    getScenery():RenderObject[]{
        let scenery: RenderObject[] = [];

        // tile in the rest of the water
        for(let i = -2; i <= 2; i++){
            for(let j = -2; j <= 2; j++){
                if(i != 0 && j != 0){
                    scenery.push(new Water( i *this.water.size, j *this.water.size));
                }
            }
        }

        // add a few trees close to the water
        scenery.push(new Tree(this.water, 0, this.water.size * 1.2, this.water.size * 1.1));
        scenery.push(new Tree(this.water, 0, this.water.size * 0.4, -this.water.size));
        scenery.push(new Tree(this.water, 0, -this.water.size, 0));
        scenery.push(new Tree(this.water, 0, this.water.size * 1.1, 0));
        scenery.push(new Tree(this.water, 0, 0, -this.water.size * 1.2));
        scenery.push(new Tree(this.water, 0, 0.1, this.water.size));

        // tile in trees away from the water
        for(let i = -3; i <= 3; i+=0.5){
            for(let j = -3; j <= 3; j+=0.5){
                if(Math.random() > 0.3333 && (Math.abs(j) > 1 || Math.abs(i) > 1)) {
                    scenery.push(
                        new Tree(
                            this.water,
                            0,
                            this.water.size * i + (Math.random() - 0.5) * 1.4,
                            this.water.size * j + (Math.random() - 0.5) * 1.4
                        )
                    );
                }
            }
        }

        // tile in marsh plants
        for(let i = -3; i <= 3; i+=0.5){
            for(let j = -3; j <= 3; j+=0.5){
                if(Math.abs(j) > 1 || Math.abs(i) > 1)
                scenery.push(new MarshPlants(this.water, this.water.size * i, this.water.size * j));
            }
        }

        return scenery;

    }
}