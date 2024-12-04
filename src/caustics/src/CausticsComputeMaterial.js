import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import fragmentShader from "./causticsComputeFragment.glsl";

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vPosition = worldPosition.xyz;

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;
  
}
`;

const CausticsComputeMaterial = shaderMaterial(
  {
    uLight: { value: new THREE.Vector2(0, 0, 0) },
    uTexture: { value: null },
    uIntensity: { value: 1.0 },
  },
  vertexShader,
  fragmentShader
);

export default CausticsComputeMaterial;
