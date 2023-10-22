#version 300 es

precision mediump float;

in vec4 vPosition;
in vec4 vColor;
in vec4 vNormal;
in vec4 vSpecularColor;
in float vSpecularExponent;

uniform vec4 ambient_light;
uniform float light_list[13]; // list of lights to apply to this scene

uniform mat4 model_view; // gets us into eye space
uniform mat4 projection; // gets us from eye space to normalized device space

out vec4 color; // passing this one back to the fragment shader
out vec4 ambLight;

out vec4 lightColor;
out vec4 specularColor;
out float specularExponent;

out vec3 light;
out vec3 view;
out vec3 normal;
out vec3 reflection;

void main() {
    vec4 veyepos = model_view * vPosition; // move vertex from model space to eye space
    gl_Position = projection * veyepos;
    // plus implicit "divide by w coordinate" phase

    vec4 light_position = vec4(light_list[0], light_list[1], light_list[2], light_list[3]);
    vec4 light_color = vec4(light_list[4], light_list[5], light_list[6], light_list[7]);
    vec4 light_direction = vec4(light_list[8], light_list[9], light_list[10], light_list[11]);
    float light_radius_angle = light_list[12];

    color = vColor;
    ambLight = ambient_light;

    lightColor = light_color;
    specularColor = vSpecularColor;
    specularExponent = vSpecularExponent;

    light = normalize(light_position.xyz - veyepos.xyz);
    view = normalize(-veyepos.xyz);
    normal = normalize((model_view * vNormal).xyz);
    reflection = reflect(-light, normal);
}