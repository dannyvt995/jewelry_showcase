import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import fragmentShader from "./causticsPlaneFragmentShader.glsl";

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const CausticsPlaneMaterial = shaderMaterial(
  {
    uLight: { value: new THREE.Vector2(0, 0, 0) },
    uTexture: { value: null },
    uAberration: { value: 0.02 },
  },
  vertexShader,
  fragmentShader
);

export default CausticsPlaneMaterial;
