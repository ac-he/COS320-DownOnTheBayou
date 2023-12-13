#version 300 es

precision mediump float;

in vec2 fTexCoord;

uniform sampler2D uFragColorSampler0;
uniform sampler2D uFragColorSampler1;
uniform sampler2D uFragColorSampler2;
uniform sampler2D uFragColorSampler3;
uniform sampler2D uFragColorSampler4;
uniform sampler2D uFragColorSampler5;
uniform sampler2D uFragColorSampler6;
uniform sampler2D uFragColorSampler7;
uniform sampler2D uFragColorSampler8;
uniform sampler2D uFragColorSampler9;

out vec4 fColor;

void main()
{
    float scalar = 1.0/10.0;

    fColor = vec4(0.0, 0.0, 0.0, 0.0);

    vec4 colors[10] = vec4[10](
        texture(uFragColorSampler0,fTexCoord),
        texture(uFragColorSampler1,fTexCoord),
        texture(uFragColorSampler2,fTexCoord),
        texture(uFragColorSampler3,fTexCoord),
        texture(uFragColorSampler4,fTexCoord),
        texture(uFragColorSampler5,fTexCoord),
        texture(uFragColorSampler6,fTexCoord),
        texture(uFragColorSampler7,fTexCoord),
        texture(uFragColorSampler8,fTexCoord),
        texture(uFragColorSampler9,fTexCoord)
    );

    for(int i = 0; i < 10; i++){
        vec4 colorToAdd = colors[i] * scalar;
        colorToAdd.a = scalar;
        fColor += colorToAdd;
    }
}
