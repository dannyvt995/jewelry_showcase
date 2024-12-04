
export const vertDiamondFaker = `
precision mediump sampler2DArray;
precision highp float;
precision highp int;


varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vWorldNormal = (modelMatrix*vec4(normal, 0.)).xyz;
    vec3 objectNormal = vec3( normal );
    vec3 transformedNormal = objectNormal;
    transformedNormal = normalMatrix * transformedNormal;
    vNormal = normalize( transformedNormal );
    vec3 transformed = vec3( position ) ;
    vec4 mvPosition = vec4( transformed, 1.0 );
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;
    vUv = uv;
    vec4 worldPosition = vec4( transformed, 1.0 );
    worldPosition = modelMatrix * worldPosition;
    vWorldPosition = worldPosition.xyz;
}

`

export const fragDiamonFaker  =  `


precision highp float;
precision highp int;

// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;
// uniform bool isOrthographic;

vec4 LinearToLinear( in vec4 value ) {
    return value;
}
vec4 LinearTosRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 sRGBToLinear( in vec4 value ) {
    return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}

vec4 RGBMToLinear( in vec4 value, in float maxRange ) {
    return vec4( value.rgb * value.a * maxRange, 1.0 );
}
vec4 LinearToRGBM( in vec4 value, in float maxRange ) {
    float maxRGB = max( value.r, max( value.g, value.b ) );
    float M = clamp( maxRGB / maxRange, 0.0, 1.0 );
    M = ceil( M * 255.0 ) / 255.0;
    return vec4( value.rgb / ( M * maxRange ), M );
}
// vec4 linearToOutputTexel( vec4 value ) {
//     return LinearToRGBM( value, 16.0 );
// }
vec4 transmissionSamplerMapTexelToLinear( vec4 value ) {
    return LinearToLinear( value );
}
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;


uniform float radius;
uniform vec3 centerOffset;
uniform mat4 modelOffsetMatrixInv;
uniform mat4 modelOffsetMatrix;
uniform mat4 projectionMatrix;
uniform samplerCube tCubeMapNormals;
uniform sampler2D envMap;
uniform float envMapIntensity;
uniform float transmission;
uniform vec2 transmissionSamplerSize;
uniform sampler2D transmissionSamplerMap;
uniform float refractiveIndex;
uniform float rIndexDelta;
uniform float squashFactor;
uniform float geometryFactor;
uniform vec3 color;
uniform vec3 colorCorrection;
uniform vec3 boostFactors;
uniform float gammaFactor;
uniform float absorptionFactor;
uniform float envMapRotation;
uniform vec4 envMapRotationQuat;
uniform float reflectivity;

vec3 BRDF_Specular_GGX_Environment(const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness) {
    float dotNV = abs(dot(normal, viewDir));
    const vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);
    const vec4 c1 = vec4(1, 0.0425, 1.04, -0.04);
    vec4 r = roughness*c0+c1;
    float a004 = min(r.x*r.x, exp2(-9.28*dotNV))*r.x+r.y;
    vec2 AB = vec2(-1.04, 1.04)*a004+r.zw;
    return specularColor*AB.x+AB.y;
}
vec2 cartesianToPolar(vec3 n) {
    vec2 uv;
    uv.x = atan(n.z, n.x)/(3.1428*2.)+0.5;
    uv.y = asin(n.y)/3.1428+0.5;
    return uv;
}
vec4 sampleEnvMap(vec3 direction) {
    float cs = cos(envMapRotation);
    float sn = sin(envMapRotation);
    float temp = cs*direction.x+sn*direction.z;
    direction.z = -sn*direction.x+cs*direction.z;
    direction.x = temp;
    direction.x *= -1.;
    direction.y *= -1.;
    direction.z *= -1.;
    vec3 t = 2.*cross(envMapRotationQuat.xyz, direction);
    direction += envMapRotationQuat.w*t+cross(envMapRotationQuat.xyz, t);
    return(texture(envMap, cartesianToPolar(direction)));
    return vec4(1, 0, 1, 1);
}
vec4 SampleSpecularReflection(vec3 direction) {
    direction = (viewMatrix*vec4(direction, 0.)).xyz;
    return envMapIntensity*(sampleEnvMap(direction));
}
vec4 SampleSpecularContribution(vec3 direction) {
    direction = mat3(modelOffsetMatrix)*direction;
    direction = (viewMatrix*vec4(direction, 0.)).xyz;
    direction = normalize(direction);
    direction.x *= -1.;
    direction.z *= -1.;
    return envMapIntensity*(sampleEnvMap(direction));
}
vec4 SampleSpecularContributionRef(vec3 origin, int i) {
    vec4 ndcPos = projectionMatrix*viewMatrix*vec4(origin, 1.);
    vec2 refractionCoords = ndcPos.xy/ndcPos.w;
    refractionCoords += 1.;
    refractionCoords /= 2.;
    return transmissionSamplerMapTexelToLinear(texture(transmissionSamplerMap, refractionCoords));
}
vec3 intersectSphere(vec3 origin, vec3 direction) {
    origin -= (centerOffset) ;
    direction.y /= squashFactor;
    float A = dot(direction, direction);
    float B = 2.*dot(origin, direction);
    float C = dot(origin, origin)-radius*radius;
    float disc = B*B-4.*A*C;
    if(disc>0.) {
        disc = sqrt(disc);
        float t1 = (-B+disc)*geometryFactor/A;
        float t2 = (-B-disc)*geometryFactor/A;
        float t = (t1>t2)?t1:t2;
        direction.y *= squashFactor;
        return vec3(origin+(centerOffset) +direction*t);
    }
    return vec3(0.);
}
vec3 linePlaneIntersect(in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal) {
    return lineDirection*(dot(planeNormal, pointOnPlane-pointOnLine)/dot(planeNormal, lineDirection))+pointOnLine;
}
vec4 getNormalDistance(vec3 d) {
    return texture(tCubeMapNormals, d);
}
vec3 getSurfaceNormal(vec4 surfaceInfos) {
    vec3 surfaceNormal = surfaceInfos.rgb;
    surfaceNormal = surfaceNormal*2.-1.;
    return-normalize(surfaceNormal);
}
vec3 intersect(vec3 rayOrigin, vec3 rayDirection) {
    vec3 sphereHitPoint = intersectSphere(rayOrigin, rayDirection);
    vec3 direction1 = normalize(sphereHitPoint-(centerOffset) );
    vec4 normalDistanceData1 = getNormalDistance(direction1);
    float distance1 = normalDistanceData1.a*radius;
    vec3 pointOnPlane1 = (centerOffset) +direction1*distance1;
    vec3 planeNormal1 = getSurfaceNormal(normalDistanceData1);
    vec3 hitPoint1 = linePlaneIntersect(rayOrigin, rayDirection, pointOnPlane1, planeNormal1);
    vec3 direction2 = normalize(hitPoint1-(centerOffset) );
    vec4 normalDistanceData2 = getNormalDistance(direction2);
    float distance2 = normalDistanceData2.a*radius;
    vec3 pointOnPlane2 = (centerOffset) +direction2*distance2;
    vec3 hitPoint = hitPoint1;
    vec3 planeNormal2 = getSurfaceNormal(normalDistanceData2);
    hitPoint = linePlaneIntersect(rayOrigin, rayDirection, pointOnPlane2, planeNormal2);
    return hitPoint;
}
vec3 debugBounces(int count) {
    vec3 color = vec3(1., 1., 1.);
    if(count == 1)color = vec3(0., 1., 0.);
    else if(count == 2)color = vec3(0., 0., 1.);
    else if(count == 3)color = vec3(1., 1., 0.);
    else if(count == 4)color = vec3(0., 1., 1.);
    else color = vec3(0., 1., 0.);
    if(count == 0)color = vec3(1., 0., 0.);
    return color;
}
vec3 getRefractionColor(vec3 origin, vec3 direction, vec3 normal) {
    vec3 outColor = vec3(0.);
    const float n1 = 1.;
    const float epsilon = 1e-4;
    float f0 = (2.4-n1)/(2.4+n1);
    f0 *= f0;
    vec3 attenuationFactor = vec3(1.);
    vec3 newDirection = refract(direction, normal, n1/refractiveIndex);
    vec3 brdfRefracted = BRDF_Specular_GGX_Environment(newDirection, -normal, vec3(f0), 0.);
    attenuationFactor *= (vec3(1.)-brdfRefracted);
    int count = 0;
    mat4 invModelOffsetMatrix = modelOffsetMatrixInv;
    newDirection = normalize((invModelOffsetMatrix*vec4(newDirection, 0.)).xyz);
    origin = (invModelOffsetMatrix*vec4(origin, 1.)).xyz;
    for(int i = 0;i<5;i++) {
        vec3 intersectedPos = intersect(origin, newDirection);
        vec3 dist = intersectedPos-origin;
        vec3 d = normalize(intersectedPos-(centerOffset) );
        vec3 mappedNormal = getNormalDistance(d).rgb;
        mappedNormal = 2.*mappedNormal-1.;
        mappedNormal = -normalize(mappedNormal);
        float r = length(dist)/radius*absorptionFactor;
        attenuationFactor *= exp(-r*(1.-color));
        origin = intersectedPos;
        vec3 origin2 = (modelOffsetMatrix*vec4(intersectedPos, 1)).xyz;
        vec3 oldDir = newDirection;
        newDirection = refract(newDirection, mappedNormal, refractiveIndex/n1);
        if(dot(newDirection, newDirection)<epsilon) {
            newDirection = reflect(oldDir, mappedNormal);
            if(i == 5-1) {
                vec3 brdfReflected = BRDF_Specular_GGX_Environment(-oldDir, mappedNormal, vec3(f0), 0.);
                vec3 d1 = mat3(modelOffsetMatrix)*oldDir;
                d1 = normalize(d1);
                float cosT = 1.-dot(direction, d1);
                outColor += ((transmission>0.&&cosT<transmission)?SampleSpecularContributionRef(origin2+0.5*d1*cosT, i).rgb:SampleSpecularContribution(oldDir).rgb)*attenuationFactor*colorCorrection*boostFactors*(vec3(1.)-brdfReflected);
            }

        }
        else {
            vec3 brdfRefracted = vec3(1.)-BRDF_Specular_GGX_Environment(newDirection, -mappedNormal, vec3(f0), 0.);
            vec3 d1 = normalize(mat3(modelOffsetMatrix)*newDirection);
            float cosT = 1.-dot(direction, d1);
            if(transmission>0.&&cosT<transmission) {
                outColor += SampleSpecularContributionRef(origin2+0.5*d1*cosT, i).rgb*brdfRefracted*attenuationFactor*colorCorrection*boostFactors;
            }
            else {
                vec3 dir0 = newDirection;
                vec3 dir1 = refract(oldDir, mappedNormal, (refractiveIndex+rIndexDelta)/n1);
                vec3 dir2 = refract(oldDir, mappedNormal, (refractiveIndex-rIndexDelta)/n1);
                outColor += vec3(SampleSpecularContribution(dir1).r, SampleSpecularContribution(dir0).g, SampleSpecularContribution(dir2).b)*brdfRefracted*attenuationFactor*colorCorrection*boostFactors;
            }
            newDirection = reflect(oldDir, mappedNormal);
            vec3 brdfReflected = BRDF_Specular_GGX_Environment(newDirection, mappedNormal, vec3(f0), 0.);
            attenuationFactor *= brdfReflected*boostFactors;
            count++;
        }

    }
    return outColor;
}
void main() {
    vec3 normalizedNormal = normalize(vWorldNormal);
    vec3 viewVector = normalize(vWorldPosition-cameraPosition);
    const float n1 = 1.;
    const float epsilon = 1e-4;
    float f0 = (2.4-n1)/(2.4+n1);
    f0 *= f0;
    vec3 attenuationFactor = vec3(1.);
    vec3 reflectedDirection = reflect(viewVector, normalizedNormal);
    vec3 brdfReflected = BRDF_Specular_GGX_Environment(reflectedDirection, normalizedNormal, vec3(f0), 0.);
    vec3 reflectionColor = SampleSpecularReflection(reflectedDirection).rgb*brdfReflected*reflectivity*2.;
    vec3 refractionColor = getRefractionColor(vWorldPosition, viewVector, normalizedNormal);
    vec3 normal = normalize(vNormal);
    vec3 diffuseColor = vec3(1.);
    gl_FragColor = vec4((refractionColor.rgb+reflectionColor.rgb)*diffuseColor, 1.);
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(gammaFactor));
    gl_FragColor = linearToOutputTexel( gl_FragColor );
 //   gl_FragColor = vec4(1.,.5,.1,1.);
}

`