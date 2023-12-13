#version 300 es

precision mediump float;

in vec2 fTexCoord;

uniform sampler2D uTableSampler;

out vec4 fColor;

void main()
{
    fColor = texture(uTableSampler, fTexCoord);
    //fColor = fColor.gbra;
}
