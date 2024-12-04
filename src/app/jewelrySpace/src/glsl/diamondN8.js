import {
    shaderStructs,
    shaderIntersectFunction,
} from '../../../../lib/three-mesh-bvh@0.5.10';
export const vertDiamond = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    uniform mat4 viewMatrixInv;
    void main() {
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vNormal = (viewMatrixInv * vec4(normalMatrix * normal, 0.0)).xyz;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
`

export const fragDiamond = `
  precision highp isampler2D;
    precision highp usampler2D;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    uniform samplerCube envMap;
    uniform float bounces;
    ${ shaderStructs }
    ${ shaderIntersectFunction }
    uniform BVH bvh;
    uniform float ior;
    uniform vec3 color;
    uniform bool correctMips;
    uniform bool chromaticAberration;
    uniform mat4 projectionMatrixInv;
    uniform mat4 viewMatrixInv;
    uniform mat4 modelMatrix;
    uniform vec2 resolution;
    uniform bool chromaticAbberation;
    uniform float aberrationStrength;
    vec3 totalInternalReflection(vec3 ro, vec3 rd, vec3 normal, float ior, mat4 modelMatrixInverse) {
        vec3 rayOrigin = ro;
        vec3 rayDirection = rd;
        rayDirection = refract(rayDirection, normal, 1.0 / ior);
        rayOrigin = vWorldPosition + rayDirection * 0.001;
        rayOrigin = (modelMatrixInverse * vec4(rayOrigin, 1.0)).xyz;
        rayDirection = normalize((modelMatrixInverse * vec4(rayDirection, 0.0)).xyz);
        for(float i = 0.0; i < bounces; i++) {
            uvec4 faceIndices = uvec4( 0u );
            vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
            vec3 barycoord = vec3( 0.0 );
            float side = 1.0;
            float dist = 0.0;
            bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
            vec3 hitPos = rayOrigin + rayDirection * max(dist - 0.001, 0.0);
           // faceNormal *= side;
            vec3 tempDir = refract(rayDirection, faceNormal, ior);
            if (length(tempDir) != 0.0) {
                rayDirection = tempDir;
                break;
            }
            rayDirection = reflect(rayDirection, faceNormal);
            rayOrigin = hitPos + rayDirection * 0.01;
        }
        rayDirection = normalize((modelMatrix * vec4(rayDirection, 0.0)).xyz);
        return rayDirection;
    }
    void main() {
        mat4 modelMatrixInverse = inverse(modelMatrix);
        vec2 uv = gl_FragCoord.xy / resolution;
        vec3 directionCamPerfect = (projectionMatrixInv * vec4(uv * 2.0 - 1.0, 0.0, 1.0)).xyz;
        directionCamPerfect = (viewMatrixInv * vec4(directionCamPerfect, 0.0)).xyz;
        directionCamPerfect = normalize(directionCamPerfect);
        vec3 normal = vNormal;
        vec3 rayOrigin = cameraPosition;
        vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
        vec3 finalColor;
        if (chromaticAberration) {
        vec3 rayDirectionR = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 - aberrationStrength), 1.0), modelMatrixInverse);
        vec3 rayDirectionG = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0), modelMatrixInverse);
        vec3 rayDirectionB = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 + aberrationStrength), 1.0), modelMatrixInverse);
        float finalColorR = textureGrad(envMap, rayDirectionR, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).r;
        float finalColorG = textureGrad(envMap, rayDirectionG, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).g;
        float finalColorB = textureGrad(envMap, rayDirectionB, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).b;
        finalColor = vec3(finalColorR, finalColorG, finalColorB) * color;
        } else {
            rayDirection = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0), modelMatrixInverse);
            finalColor = textureGrad(envMap, rayDirection, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).rgb;
            finalColor *= color;
        }
        gl_FragColor = vec4(vec3(finalColor), 1.0);
}
`