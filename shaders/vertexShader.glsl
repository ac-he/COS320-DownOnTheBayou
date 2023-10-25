#version 300 es

precision mediump float;

uniform mat4 uModelView; // gets us into eye space
uniform mat4 uProjection; // gets us from eye space to normalized device space

in vec4 vPosition;
in vec4 vColor;
in vec4 vNormal;
in vec4 vSpecularColor;
in float vSpecularExponent;

out vec4 position;
out vec4 color;
out vec4 normal;
out vec4 specularColor;
out float specularExponent;

void main() {
    // move vertex from model space to eye space and set the position
    vec4 eyePosition = uModelView * vPosition;
    gl_Position = uProjection * eyePosition;

    // export attributes needed by the fragent shader
    position = eyePosition;
    color = vColor;
    normal = uModelView * vNormal;
    specularColor = vSpecularColor;
    specularExponent = vSpecularExponent;
}