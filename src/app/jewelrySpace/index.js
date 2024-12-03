"use client"
import * as THREE from 'three'
import { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls, Preload } from '@react-three/drei'


import { Perf } from 'r3f-perf';
import SceneView from './src/SceneView'
import { RGBELoader } from 'three-stdlib';

import s from './style.module.css'


export default function CanvasCus() {
    const texture = useLoader(RGBELoader, '/ring/env/peppermint_powerplant_2_1k.hdr')
    texture.mapping = THREE.EquirectangularReflectionMapping
    return (
        <div className={s.canvas}>

            <Canvas
            eventSource={document.getElementById('root')}
            dpr={0.7} gl={{ antialias: false }} shadows camera={{ position: [0, 0, 15], fov: 35, near: 0.5, far: 100 }}>
                <Perf />
                <color attach="background" args={['#f0f0f0']} />
                <OrbitControls/>
                <ambientLight />
              
                <Suspense fallback={null}>
                    <Environment map={texture} />
                    <SceneView map={texture}/>
                </Suspense>
     
                <Preload all/>
            </Canvas>
        </div>
    )
}
