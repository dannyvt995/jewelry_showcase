import { useLoader } from '@react-three/fiber'
import { Html, useProgress, AccumulativeShadows, useEnvironment , Loader} from "@react-three/drei"
import { useThree } from "@react-three/fiber";
import React,{useMemo, memo, Suspense, useEffect, useRef,useState } from "react";
import { Rhino3dmLoader, RGBELoader, GLTFLoader, OBJLoader, DRACOLoader } from 'three-stdlib';

import HandleModel from '../HandleModel'
import useLoaderStore from '../../../store/useStoreLoader';
const Model = React.memo(({ id }) => {
  const [model, setModel] = useState(null);
  const { scene } = useThree();
  const loader = useLoaderStore((state) => state.loaderModel);
  
  const modelRef = useRef(null); // Ref giữ tham chiếu tới model


  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
     
      loader.load(`/ring/collection/${id}.glb`, (gltf) => {
      
      
          const clonedModel = gltf.scene.clone(true); 
          setModel(clonedModel);
          modelRef.current = clonedModel;
      
      });
    }
    return () => {
      isMounted = false;

      if (modelRef.current) {
        disposeScene({
          sceneOrigin: scene,
          sceneCustom: modelRef.current,
        });
        modelRef.current = null; 
     
      }
    };
  }, [id, loader, scene]); 

  return model ? <HandleModel model={model} id={id} /> : null;
});

const disposeScene = ({
  sceneOrigin,
  sceneCustom
 }) => {
  //console.log("///////////////////disposeScene/////////////clear memory")
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
    //console.log("dispose map")
    material.map.dispose(); 
    material.dispose()
  }
  if (material.envMap) {
   // console.log("dispose envMap")
    material.envMap.dispose();
    material.dispose()
  }
  if (material.uniforms && material.uniforms.envMap.value) {
    material.uniforms.envMap.value.dispose();
    material.uniforms.envMap.value = null;  
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