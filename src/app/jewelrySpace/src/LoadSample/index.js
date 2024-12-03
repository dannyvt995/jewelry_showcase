import { useLoader } from '@react-three/fiber'
import { Html, useProgress, AccumulativeShadows, useEnvironment , Loader} from "@react-three/drei"
import { useThree } from "@react-three/fiber";
import React,{useMemo, memo, Suspense, useEffect, useRef,useState } from "react";
import { Rhino3dmLoader, RGBELoader, GLTFLoader, OBJLoader, DRACOLoader } from 'three-stdlib';

import HandleModel from '../HandleModel'
const Model = React.memo(({ id }) => {
  const [model, setModel] = useState(null)
  const {scene} = useThree()
  const loader = useMemo(() => {

    
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderConfig({ type: 'js' })
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)
    return gltfLoader
  }, [])

  useEffect(() => {
    let isMounted = true
    let currentModel = []
  
    loader.load(`/ring/collection/${id}.glb`, (gltf) => {
      if (isMounted) {
   
        currentModel = null
   
        setModel(gltf.scene)
      }
    })
  
    return () => {
      isMounted = false
      if (model) {
       disposeScene({
        sceneOrigin:scene,
        sceneCustom:model
       })
       setModel(null)
      }
   
     
    }
  }, [id, loader])

  return model ? (
    <HandleModel model={model} id={id}/>
  ) : null
})

const disposeScene = ({
  sceneOrigin,
  sceneCustom
 }) => {
  console.log("///////////////////disposeScene/////////////clear memory")
  sceneCustom.removeFromParent();
  sceneCustom.traverse((child) => {
  // console.log(child)
    if (child.geometry) {
      child.geometry.dispose()
    }
    if (child.material) {
  
      if (Array.isArray(child.material)) {
           
        child.material.forEach((material) => {
          clearTextureInMaterial(material)
     
        })
      } else {
        //console.log("dispose material")
        clearTextureInMaterial(child.material)

      }
    }
  if(child.type === "Group" || child.type === "Object3D") {

    child.traverse((cc) => {
  
      if (cc.geometry) {
        cc.geometry.dispose()
      }
      if (cc.material) {
    
        if (Array.isArray(cc.material)) {
          
          cc.material.forEach((material) => {
            clearTextureInMaterial(material)
   
          })
        } else {
       
          clearTextureInMaterial(cc.material)
        }
      }
    })
  }

  })
  sceneOrigin.remove(sceneCustom)
 // console.log(scene)
  //scene.clear()
}
const clearTextureInMaterial = (material) => {
  if (material.map) {
    console.log("dispose map")
    material.map.dispose(); 
    material.dispose()
  }
  if (material.envMap) {
    console.log("dispose envMap")
    material.envMap.dispose();
    material.dispose()
  }
};
function LoadSample({ modelId }) {
  return (
    <>

      <Suspense fallback={<Loader/>}>
        <Model id={modelId} />
      </Suspense>
       

   
    </>
  )
}

export default memo(LoadSample)