
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec3 uLight;
uniform float uIntensity;

void main() {
  vec2 uv = vUv;
  float scale = 0.0;

  vec3 normalTexture = texture2D(uTexture, uv).rgb;
  vec3 normal = normalize(normalTexture);
  vec3 lightDir = normalize(uLight);
  
  vec3 ray = refract(lightDir, normal, 1.0 / 1.25);

  vec3 newPos = vPosition.xyz + ray;
  vec3 oldPos = vPosition.xyz;

  float lightArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newLightArea = length(dFdx(newPos)) * length(dFdy(newPos));
  
  float value = lightArea / newLightArea * 0.2;
  scale += clamp(value, 0.0, 1.0) * uIntensity;
  scale *= scale;


  gl_FragColor = vec4(vec3(scale), 1.0);
}
