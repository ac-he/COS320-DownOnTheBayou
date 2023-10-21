#version 300 es

precision mediump float;

in vec4 vPosition;
in vec4 vColor;
in vec4 vNormal;
in vec4 vAmbientDiffuseColor;
in vec4 vSpecularColor;
in vec4 vSpecularExponent;

uniform vec4 ambient_light;

uniform mat4 model_view; // gets us into eye space
uniform mat4 projection; // gets us from eye space to normalized device space

out vec4 color; // passing this one back to the fragment shader
out vec4 ambLight;

void main() {
    gl_Position = projection * model_view * vPosition;
    // plus implicit "divide by w coordinate" phase

    color = vColor;
    //color = vNormal;
    ambLight = ambient_light;
}