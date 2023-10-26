#version 300 es

precision mediump float;

uniform vec4 uAmbientLight;
uniform float uLightList[78];
uniform int uLightCount;

in vec4 position;
in vec4 color;
in vec4 normal;
in vec4 specularColor;
in float specularExponent;

out vec4 fColor;

void main()
{
    // start with only the ambient term of the phong lighting equation
    vec4 amb = color * uAmbientLight;
    fColor = amb;

    for(int i = 0; i < uLightCount * 13; i+=13){
        // parse light data
        vec4 lightPosition = vec4(uLightList[i + 0], uLightList[i + 1], uLightList[i + 2], uLightList[i + 3]);
        vec4 lightColor = vec4(uLightList[i + 4], uLightList[i + 5], uLightList[i + 6], uLightList[i + 7]);
        vec4 lightDirection = vec4(uLightList[i + 8], uLightList[i + 9], uLightList[i + 10], uLightList[i + 11]);
        float lightRadiusAngle = uLightList[i + 12];

        // set up the "big 4" lighting component vectors
        vec3 L = normalize(lightPosition.xyz - position.xyz);// LIGHT
        vec3 V = normalize(-position.xyz);// VIEW
        vec3 N = normalize(normal.xyz);// NORMAL
        // if the normal vector is backwards, reverse it
        if (dot(N, V) < 0.0){
            N = N * -1.0;
        }
        // this helps with the one-sided geometry (leaves, fan blades, etc)
        vec3 R = reflect(-L, N);// REFLECT

        // calculate the two non-ambient terms of phong lighting
        vec4 diff = max(dot(L, N), 0.0) * color * lightColor;
        vec4 spec = pow(max(dot(R, V), 0.0), specularExponent) * specularColor * lightColor;

        // don't include the specular term for surfaces that are hidden
        if (dot(L, N) < 0.0) {
            spec = vec4(0, 0, 0, 0);
        }

        // calculate the angle between the light source and the surface
        float angle = dot(normalize(lightDirection.xyz), L);

        // if this fragment is within range to be hit by this light, use the whole lighting equation
        if (angle >= lightRadiusAngle){
            fColor += diff + spec;
        }
    }
    //make sure the alpha value remains at 1 after all the calculations
    fColor.a = 1.0;
}
