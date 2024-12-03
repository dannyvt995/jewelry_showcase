"use client"
import { 
    OrbitControls, 
    Environment,
    PerspectiveCamera,
    useFBO,
    SpotLight,
    useGLTF,
  } from "@react-three/drei";
  import { Canvas, useFrame } from "@react-three/fiber";
  import { useControls } from "leva";
  import { useRef, useState, useMemo, forwardRef } from "react";
  import * as THREE from "three";
  import { FullScreenQuad } from "three-stdlib";
  
  import CausticsPlaneMaterial from "./src/CausticsPlaneMaterial";
  import CausticsComputeMaterial from "./src/CausticsComputeMaterial";
  import NormalMaterial from "./src/NormalMaterial";
  import { MeshTransmissionMaterial } from "./src/MeshTransmissionMaterial";
import { Perf } from "r3f-perf";
  

  
  const config = {
    backsideThickness: 0.3,
    thickness: 0.3,
    samples: 8,
    transmission: 0.9,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    chromaticAberration: 1.25,
    anisotropy: 0.2,
    roughness: 0,
    distortion: 0,
    distortionScale: 0.09,
    temporalDistortion: 0,
    ior: 1.25,
    color: "#ffffff",
  };
  
  const BUNNY_GEOMETRY_URL = "https://cdn.maximeheckel.com/models/bunny.glb";
  
  const BunnyGeometry = forwardRef((props, ref) => {
    const { nodes } = useGLTF(BUNNY_GEOMETRY_URL);
  
    return (
      <mesh
        ref={ref}
        geometry={nodes.Stanford_Bunny.geometry}
        scale={0.025}
        position={[0, 6.5, 0]}
        rotation={[0, 0, 0]}
      >
        <MeshTransmissionMaterial backside {...config} />
      </mesh>
    )
  })
  
  const SphereGeometry = forwardRef((props, ref) => {
    return (
      <mesh
        ref={ref}
        scale={2}
        position={[0, 6.5, 0]}
      >
        <sphereGeometry args={[3, 512, 512]} />
        <MeshTransmissionMaterial backside {...config} />
      </mesh>
    )
  })
  
  const TorusGeometry = forwardRef((props, ref) => {
    return (
      <mesh
        ref={ref}
        scale={0.4}
        position={[0, 6.5, 0]}
      >
        <torusKnotGeometry args={[10, 3, 600, 160]} />
        <MeshTransmissionMaterial backside {...config} />
      </mesh>
    )
  })
  
  const Caustics = () => {
    const mesh = useRef();
    const causticsPlane = useRef();
    const spotlightRef = useRef();
  
    
  
    const {
      light,
      intensity,
      chromaticAberration,
      displace,
      amplitude,
      frequency,
      geometry,
    } = useControls({
      light: {
        value: new THREE.Vector3(-10, 13, -10),
      },
      geometry: {
        value: "sphere",
        options: [ "sphere", "torus", "bunny",],
      },
      intensity: {
        value: 1.5,
        step: 0.01,
        min: 0,
        max: 10.0,
      },
      chromaticAberration: {
        value: 0.16,
        step: 0.001,
        min: 0,
        max: 0.4,
      },
      displace: {
        value: true,
      },
      amplitude: {
        value: 0.13,
        step: 0.01,
        min: 0,
        max: 1,
      },
      frequency: {
        value: 0.65,
        step: 0.01,
        min: 0,
        max: 4,
      },
    });
  
    const TargetMesh = useMemo(() => {
      switch (geometry) {
        case "sphere":
          return SphereGeometry;
        case "torus":
          return TorusGeometry;
        case "bunny":
          return BunnyGeometry;
        default:
          return SphereGeometry;
      }
    }, [geometry])
  
    const normalRenderTarget = useFBO(2000, 2000, {});
    const [normalCamera] = useState(
      () => new THREE.PerspectiveCamera(65, 1, 0.1, 1000)
    );
    const [normalMaterial] = useState(() => new NormalMaterial());
  
  
    const causticsComputeRenderTarget = useFBO(2000, 2000, {});
    const [causticsQuad] = useState(() => new FullScreenQuad());
    const [causticsComputeMaterial] = useState(() => new CausticsComputeMaterial());
  
    const [causticsPlaneMaterial] = useState(() => new CausticsPlaneMaterial());
    causticsPlaneMaterial.transparent = true;
    causticsPlaneMaterial.blending = THREE.CustomBlending;
    causticsPlaneMaterial.blendSrc = THREE.OneFactor;
    causticsPlaneMaterial.blendDst = THREE.SrcAlphaFactor;
  
    useFrame((state) => {
      const { gl, clock, camera } = state;
  
      camera.lookAt(0, 0, 0);
  
      const bounds = new THREE.Box3().setFromObject(mesh.current, true);
  
      let boundsVertices = [];
      boundsVertices.push(
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z)
      );
      boundsVertices.push(
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z)
      );
  
      const lightDir = new THREE.Vector3(
        light.x,
        light.y,
        light.z
      ).normalize();
  
      // Calculates the projected coordinates of the vertices onto the plane
      // perpendicular to the light direction
      const projectedCoordinates = boundsVertices.map((v) =>
        {
          const newX = v.x + lightDir.x * (-v.y / lightDir.y);
          const newY = v.y + lightDir.y * (-v.y / lightDir.y);
          const newZ = v.z + lightDir.z * (-v.y / lightDir.y);
  
          return new THREE.Vector3(newX, newY, newZ);
        }
      );
  
      // Calculates the combined spatial coordinates of the projected vertices
      // and divides by the number of vertices to get the center position
      const centerPos = projectedCoordinates
        .reduce((a, b) => a.add(b), new THREE.Vector3(0, 0, 0))
        .divideScalar(projectedCoordinates.length);
  
      // Calculates the scale of the caustic plane based on the distance of the
      // furthest vertex from the center (using euclidean distance)
      const scale = projectedCoordinates
        .map((p) =>
          Math.sqrt(
            Math.pow(p.x - centerPos.x, 2),
            Math.pow(p.z - centerPos.z, 2)
          )
        )
        .reduce((a, b) => Math.max(a, b), 0);
  
      // The scale of the plane is multiplied by this correction factor to
      // avoid the caustics pattern to be cut / overflow the bounds of the plane
      // my normal projection or my math must be a bit off, so I'm trying to be very conservative here
      const scaleCorrection = 1.75;
  
      causticsPlane.current.scale.set(
        scale * scaleCorrection,
        scale * scaleCorrection,
        scale * scaleCorrection
      );
      causticsPlane.current.position.set(centerPos.x, centerPos.y, centerPos.z);
  
      normalCamera.position.set(light.x, light.y, light.z);
      normalCamera.lookAt(
        bounds.getCenter(new THREE.Vector3(0, 0, 0)).x,
        bounds.getCenter(new THREE.Vector3(0, 0, 0)).y,
        bounds.getCenter(new THREE.Vector3(0, 0, 0)).z
      );
      normalCamera.up = new THREE.Vector3(0, 1, 0);
  
      const originalMaterial = mesh.current.material;
  
      mesh.current.material = normalMaterial;
      mesh.current.material.side = THREE.BackSide;
  
      mesh.current.material.uniforms.time.value = clock.elapsedTime;
      mesh.current.material.uniforms.uDisplace.value = displace;
      mesh.current.material.uniforms.uAmplitude.value = amplitude;
      mesh.current.material.uniforms.uFrequency.value = frequency;
  
      gl.setRenderTarget(normalRenderTarget);
      gl.render(mesh.current, normalCamera);
  
      mesh.current.material = originalMaterial;
      mesh.current.material.uniforms.time.value = clock.elapsedTime;
      mesh.current.material.uniforms.uDisplace.value = displace;
      mesh.current.material.uniforms.uAmplitude.value = amplitude;
      mesh.current.material.uniforms.uFrequency.value = frequency;
  
      causticsQuad.material = causticsComputeMaterial;
      causticsQuad.material.uniforms.uTexture.value = normalRenderTarget.texture;
      causticsQuad.material.uniforms.uLight.value = light;
      causticsQuad.material.uniforms.uIntensity.value = intensity;
  
      gl.setRenderTarget(causticsComputeRenderTarget);
      causticsQuad.render(gl);
  
      causticsPlane.current.material = causticsPlaneMaterial;
  
      causticsPlane.current.material.uniforms.uTexture.value =
        causticsComputeRenderTarget.texture;
      causticsPlane.current.material.uniforms.uAberration.value =
      chromaticAberration;
  
      gl.setRenderTarget(null);
  
      spotlightRef.current.position.set(light.x, light.y, light.z);
      spotlightRef.current.distance = Math.sqrt(
        Math.pow(
          spotlightRef.current.position.x - causticsPlane.current.position.x,
          2
        ) +
          Math.pow(
            spotlightRef.current.position.y - causticsPlane.current.position.y,
            2
          ) +
          Math.pow(
            spotlightRef.current.position.z - causticsPlane.current.position.z,
            2
          )
      );
    });
  
    return (
      <>
        <SpotLight
          castShadow
          ref={spotlightRef}
          penumbra={1}
          distance={25}
          angle={0.65}
          attenuation={20}
          anglePower={10}
          intensity={1}
          color="#fff"
          target={causticsPlane.current}
        />
        <TargetMesh ref={mesh}/>
        <mesh ref={causticsPlane} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry />
        </mesh>
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.2, -0.2]}
        >
          <planeGeometry args={[50, 50]} />
          <meshPhongMaterial
            transparent
            blending={THREE.CustomBlending}
            blendSrc={THREE.OneFactor}
            blendDst={THREE.SrcAlphaFactor}
          />
        </mesh>
      </>
    );
  };
  
  const page = () => {
    return (
      <Canvas shadows dpr={[.72,1]} style={{ zIndex: 9999, pointerEvents: 'none', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>
        <Caustics />
        <PerspectiveCamera makeDefault position={[0, 20, 20]} fov={65} />
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/syferfontein_0d_clear_puresky_1k.hdr"
          ground={{ height: 45, radius: 100, scale: 300 }}
        />
        <Perf/>
      </Canvas>
    );
  };
  
  
  export default page
  