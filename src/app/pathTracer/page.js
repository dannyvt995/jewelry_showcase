"use client"
import { Canvas } from '@react-three/fiber'
import { Gltf, Backdrop, OrbitControls, Environment, Resize } from '@react-three/drei'
import { Pathtracer, PhysicalCamera, Fog } from '../../utils/Pathtracer.js'
import { Perf } from 'r3f-perf'

export default function page() {
    return (
        <Canvas dpr={1} style={{ zIndex: 9999, position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>

        <Pathtracer>
            <PhysicalCamera position={[0.1, 2.3, 2.9]} fStop={1.4} focusDistance={5} />
     {/*        <Fog scale={1} emissive="orange" emissiveIntensity={1} density={0.5} /> */}
            <Environment preset="city" />
            <group position={[0, -0.5, 0]}>
                <Resize>
                <Gltf src="/ring/collection/model6.glb" position={[0.25, 0, 0]} rotation={[0, -0.4, 0]} />
                </Resize>
            </group>
        </Pathtracer>
        <Perf/>

            <OrbitControls makeDefault enableDamping={true} zoomSpeed={0.4} />
        </Canvas>


    )
}
