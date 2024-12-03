"use client"
import { View, Preload, Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import {useEffect,useState} from 'react'

import { Pathtracer, PhysicalCamera, Fog } from '../../../utils/Pathtracer.js'
import LoadControls from '../../jewelrySpace/src/LoadControls/index.js'
export default function CanvasWrapper() {
    console.log("==> INIT CanvasWrapper ONCE TIME");
    const [eventSource, setEventSource] = useState(null)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            setEventSource(document.getElementById('root'))
            console.log("????",eventSource)
        }
    }, [])
    return (

        
        <Canvas

            style={{ zIndex: 9999, pointerEvents: 'none', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}
            eventSource={eventSource}
            dpr={1} gl={{ antialias: false, alpha: true }} shadows camera={{ position: [0, 0, 15], fov: 35, near: 0.5, far: 100 }}>
   

  
        <View.Port />

         
            <Preload all />
            <Perf />

        </Canvas>

    )
}
