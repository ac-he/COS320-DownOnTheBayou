import {vec4} from "./helperfunctions.js";

export abstract class RenderObject {
    // where it starts in the buffer
    bufferIndex:number;
    direction:number;

    xPos:number;
    zPos:number;

    // store all the vectors that make up this object;
    protected positions:vec4[];
    protected colors:vec4[];
    protected normals:vec4[];

    protected LOG_NAME:string;

    // Constructor
    protected constructor(){
        this.bufferIndex = 0; // will be set properly later

        this.direction = 0;
        this.xPos = this.zPos = 0;

        this.setLogDebugName();
        this.createObjectPoints();
        this.calculateNormals();
    }

    // specify a name for this object in case it needs to be logged
    abstract setLogDebugName(): void;

    // Specify what the triangles are for this object
    abstract createObjectPoints() : void;

    // generate all the transforms needed to properly render this object in its current state
    abstract getTransformsSequence() :any[];


    // Get the list of positions associated with this object
    getObjectPositions():vec4[] {
        return this.positions;
    }

    // Get the list of colors associated with this object
    getObjectColors():vec4[] {
        return this.colors;
    }

    // Get the list of vertex normals associated with this object
    getObjectNormals():vec4[] {
        return this.normals;
    }

    // Get the specular color associated with this object
    getSpecularColor():vec4 {
        return new vec4(1, 1, 1, 1);
    }

    // Get the specular exponent associated with this object
    getSpecularExponent():number {
        return 10;
    }

    // Get the number of points that make up this object
    getNumPoints():number {
        return this.positions.length;
    }

    // some default rotation, which some objects will use
    rotateBy(angle:number):void{
        this.direction += angle;
        if(this.direction >= 360) {
            this.direction -= 360;
        }
    }

    calculateNormals():void{
        let vertices:Map<string, vec4> = new Map<string, vec4>();
        let numTrisAndColors:number = this.positions.length;

        // Normal Vector calculation algorithm based on material from Lecture 13: Meshes, Alternative Lighting and
        // Shading, slides 29-31.

        // for each vertex being stored (count by 2 to skip colors)
        for(let i:number = 0; i < numTrisAndColors; i+=2){
            // if this vertex hasn't been added to the map yet
            if(!vertices.has(this.positions[i].flatten().join(","))){
                // add it to the map
                vertices.set(this.positions[i].flatten().join(","), new vec4(0, 0, 0, 0));
            }
        }

        // for each triangle being stored (count by 6 to move one triangle at a time)
        for(let i :number = 0; i < numTrisAndColors; i+=6){
            // storing all the vertices for this iteration
            let vertex1:vec4 = this.positions[i];
            let vertex2:vec4 = this.positions[i+2];
            let vertex3:vec4 = this.positions[i+4];

            // obtain two vectors that lie in the plane
            let vector1:vec4 = vertex2.subtract(vertex1);
            let vector2:vec4 = vertex3.subtract(vertex1);

            // normalize those vectors
            vector1 = vector1.normalize();
            vector2 = vector2.normalize();

            // find triangle normal
            let normal:vec4 = vector1.cross(vector2);

            // add the normal to all of the vertices in this triangle
            let result1:vec4 = vertices.get(vertex1.flatten().join(",")).add(normal);
            vertices.set(vertex1.flatten().join(","), result1);
            let result2:vec4 = vertices.get(vertex2.flatten().join(",")).add(normal);
            vertices.set(vertex2.flatten().join(","), result2);
            let result3:vec4 = vertices.get(vertex3.flatten().join(",")).add(normal);
            vertices.set(vertex3.flatten().join(","), result3);
        }

        // now we will set up the new list.
        this.normals = [];

        // push each vertex after normalizing the final result
        for(let i:number = 0; i < numTrisAndColors; i+=2){
            let normal = vertices.get( this.positions[i].flatten().join(","));
            // normalize the vertex normal
            normal = normal.normalize();
            this.normals.push(normal);
        }
    }
}

