#version 300 es

precision mediump float;

in vec2 fTexCoord;

uniform sampler2D uFragColorSampler;
uniform sampler2D uDepthSampler;

out vec4 fColor;

void main()
{
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    fColor = color / 10.0;
    fColor = texture(uFragColorSampler, fTexCoord);

    float depth = texture(uDepthSampler, fTexCoord).x;
}
