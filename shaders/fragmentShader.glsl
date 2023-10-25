#version 300 es

precision mediump float;

in vec4 color;
in vec4 ambLight;

in vec4 lightColor;
in vec4 specularColor;
in float specularExponent;

in vec3 light;
in vec3 view;
in vec3 normal;
in vec3 reflection;

in vec3 lightDirection;
in float lightRadiusAngle;
in vec3 surfacePosition;
in vec3 lightPosition;

out vec4  fColor;

void main()
{
    vec3 L = normalize(light); // LIGHT
    vec3 V = normalize(view); // VIEW
    vec3 N = normalize(normal); // NORMAL
    vec3 R = normalize(reflection); // REFLECT

    if(dot(N, V) < 0.0){
        N = N * -1.0;
    }

    vec4 amb = color * ambLight;
    vec4 diff = max(dot(L,N), 0.0) * color * lightColor;
    vec4 spec = pow(max(dot(R,V), 0.0), specularExponent) * specularColor * lightColor;

    if(dot(light, normal) < 0.0) { // if we are just over the horizon?
        spec = vec4(0, 0, 0, 0);
    }

    fColor = amb;
    vec3 surfaceToLight = normalize(surfacePosition) - normalize(lightPosition);
    surfaceToLight = light;
    float angle = dot(normalize(lightDirection), normalize(surfaceToLight));
    if(angle >= lightRadiusAngle){
        fColor = amb + diff + spec;
    }
    else {
        fColor = amb;
    }
    //fColor = vec4(normal, 1.0);
    fColor.a = 1.0;
}
