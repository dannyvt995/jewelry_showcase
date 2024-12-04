import { useThree } from '@react-three/fiber'
import React,{useEffect, useRef} from 'react'
import { Box3,Vector3,Color } from 'three'
import { AccumulativeShadows, RandomizedLight, Environment } from '@react-three/drei'
export default function LoadGround() {
    const {scene} = useThree()
    const groundRef = useRef(null)
    const colorAll = "#81BFDA"
    useEffect(() => {
      console.log(scene)
      setTimeout(() => {
        for (let i = 0; i < scene.children.length; i++) {
      
            if (scene.children[i].name === "GroupTarget") {
                const box = new Box3().setFromObject(scene.children[i]);
            
                const boxCenter = box.getCenter(new Vector3());
                groundRef.current.position.set(boxCenter.x, boxCenter.y - box.max.y - 0.005, boxCenter.z);
    
            }
            
          }

          scene.background = new Color(colorAll);

      }, 2000);
    }, [scene])
    
  return (
    <>
      
      <RandomizedLight intensity={Math.PI} amount={8} radius={4} ambient={0.5} position={[5, 5, -10]} bias={0.001} />
    <mesh receiveShadow rotation={[Math.PI * 0.5,0,  0]} ref={groundRef}>
        <planeGeometry args={[2,2]}/>
        <meshPhongMaterial   color={colorAll} side={1}/>
    </mesh>
    </>

  )
}
