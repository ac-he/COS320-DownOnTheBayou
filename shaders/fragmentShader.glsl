#version 300 es

precision mediump float;

in vec4 color;
in vec4 ambLight;

out vec4  fColor;

void main()
{
    vec4 amb = color * ambLight;

    fColor = amb; //+ diff + spec;
    fColor.a = 1.0;
}