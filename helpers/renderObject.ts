import {vec4} from "./helperfunctions.js";
import {AvlTree, AvlTreeNode} from "@datastructures-js/binary-search-tree";

export abstract class RenderObject {
    // where it starts in the buffer
    bufferIndex:number;
    direction:number;

    xPos:number;
    zPos:number;

    // store all the triangles that make up this object
    protected objectTris:vec4[];

    // store all the triangles and all the normal vectors
    private objectTrisWithNormals:vec4[];

    protected LOG_NAME:string;

    // Constructor
    protected constructor(){
        this.bufferIndex = 0; // will be set properly later

        this.direction = 0;
        this.xPos = this.zPos = 0;

        this.setLogDebugName();
        this.createObjectTris();
        this.calculateNormals();
    }

    // specify a name for this object in case it needs to be logged
    abstract setLogDebugName(): void;

    // Specify what the triangles are for this object
    abstract createObjectTris() : void;


    // generate all the transforms needed to properly render this object in its current state
    abstract getTransformsSequence() :any[];


    // Get the list of triangles that make up this object
    getObjectTris():vec4[] {
        return this.objectTrisWithNormals;
    }

    // Get the number of triangles that make up this object
    getNumTris():number {
        return this.objectTris.length / 2; // because each point is made of a color vector and a position vector
    }

    // some default rotation, which some objects will use
    rotateBy(angle:number):void{
        this.direction += angle;
        if(this.direction >= 360) {
            this.direction -= 360;
        }
    }

    calculateNormals():void{
        // Documentation found at
        //https://www.npmjs.com/package/@datastructures-js/binary-search-tree

        let vertices:AvlTree<vec4> = new AvlTree(
            // Set up rules for vector comparison
            (a:vec4, b:vec4) => {
                let aList:number[] = a.flatten();
                let bList:number[] = b.flatten();
                // for each element in the vectors
                for(let i = 0; i < 4; i++){
                    // find the difference
                    let diff:number = aList[i] - bList[i];
                    // use this difference if it's nonzero
                    if(diff != 0){
                        return diff;
                    }
                    // otherwise move on to the next element
                }
                // vectors are equivalent
                return 0;
            },
            {key: 'key'}
        );
        let numTrisAndColors:number = this.objectTris.length;

        // Normal Vector calculation algorithm based on material from Lecture 13: Meshes, Alternative Lighting and
        // Shading, slides 29-31.

        // for each vertex being stored (count by 2 to skip colors)
        for(let i:number = 0; i < numTrisAndColors; i+=2){
            // if this vertex hasn't been added to the map yet
            if(!vertices.has(this.objectTris[i].flatten().join(","))){
                // add it to the map
                let node = new AvlTreeNode(this.objectTris[i], new vec4(0, 0, 0, 0) );
                vertices.insert(new vec4(0, 0, 0, 0));
                vertices.setValeu
                vertices.set(this.objectTris[i].flatten().join(","), );
            }
        }

        // for each triangle being stored (count by 6 to move one triangle at a time)
        for(let i :number = 0; i < numTrisAndColors; i+=6){
            // storing all the vertices for this iteration
            let vertex1:vec4 = this.objectTris[i];
            let vertex2:vec4 = this.objectTris[i+2];
            let vertex3:vec4 = this.objectTris[i+4];

            // obtain two vectors that lie in the plane
            let vector1:vec4 = vertex2.subtract(vertex1);
            let vector2:vec4 = vertex3.subtract(vertex1);
            //console.log(this.LOG_NAME + ": " + vector1 + " and " + vector2);

            // normalize those vectors
            vector1 = vector1.normalize();
            vector2 = vector2.normalize();
            //console.log(this.LOG_NAME + ": " + vector1 + " and " + vector2);

            // find triangle normal
            let normal:vec4 = vector1.cross(vector2);
            //console.log(this.LOG_NAME + ": normal " + normal);

            // add the normal to all of the vertices in this triangle
            let result1:vec4 = vertices.get(vertex1.flatten().join(",")).add(normal);
            vertices.set(vertex1.flatten().join(","), result1);
            let result2:vec4 = vertices.get(vertex2.flatten().join(",")).add(normal);
            vertices.set(vertex2.flatten().join(","), result2);
            let result3:vec4 = vertices.get(vertex3.flatten().join(",")).add(normal);
            vertices.set(vertex3.flatten().join(","), result3);
            // console.log(this.LOG_NAME + ": " + vertex1 + " result 1 " + result1);
            // console.log(this.LOG_NAME + ": " + vertex2 + " result 2 " + result2);
            // console.log(this.LOG_NAME + ": " + vertex3 + " result 3 " + result3);
            // console.log("------------------------------------")
        }

        // now we will set up the new list.
        this.objectTrisWithNormals = [];
        // this step will add the old vec4s while merging in new normalized vec4s to represent the normals.

        // console.log("------------------------------------")
        // for(let [key, value] of vertices){
        //     console.log(key, value);
        // }
        // console.log("------------------------------------")

        // for each vertex being stored
        for(let i:number = 0; i < numTrisAndColors; i+=2){
            let vertex:vec4 = this.objectTris[i];
            let color:vec4 = this.objectTris[i+1];
            let normal:vec4 = vertices.get(vertex.flatten().join(","));

            let ambient:vec4 = this.objectTris[i];
            let specular:vec4 = new vec4(1, 1, 1, 1);
            let specExp:vec4 = new vec4(15, 0, 0, 0);
            //console.log(this.LOG_NAME + ": " + vertex.flatten().join(",") + " -- " + normal);

            // normalize the vertex normal
            normal = normal.normalize();
            //console.log(this.LOG_NAME + ": " + vertex.flatten().join(",") + " -- " + normal);

            this.objectTrisWithNormals.push(vertex, color, normal, ambient, specular, specExp);
            //console.log(this.objectTrisWithNormals);
        }

        //console.log(this.LOG_NAME + ": Num tris: " + (this.getNumTris()/3) + " | Num vertices: " + verts.size);
    }

}

