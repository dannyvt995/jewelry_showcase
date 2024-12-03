"use client"
import * as THREE from 'three'





import { makeDiamond } from '../../../../utils/DiamondN8.js'
import { MeshRefractionMaterial, useTexture, useEnvironment, Resize } from '@react-three/drei'
import React, { useRef } from 'react'
import { RGBELoader, CubeTextureLoader, EXRLoader, TextureLoader } from 'three-stdlib';
import { useThree } from '@react-three/fiber';
import { useStoreAsset } from '../../../store/useStoreAsset.js';
const color = {
    gold: 16434308
}
const checkList1 = {
    "model1": "Diamond",
    "model2": "Diamond",
    "model3": "Brillant_",
    "model4": "GG_Round",
    "model5": "GG_Pear",
    "model6": "Round",
    "model7": "GemOnCrv",
    "model8": "mesh_2",
    "model9": "mesh_56",
    "model10": "Gems",

}
export default function HandleModel({ model, id }) {
    const { exrTexture, hdrTexture} = useStoreAsset();
    const { scene, camera } = useThree()
    const modelRef = React.useRef()
    
    const priRef = React.useRef()
    const priRefSam = React.useRef()
    const [completeLoad, setCompleteLoad] = React.useState(false)
    const meshListRef = React.useRef([])
    const [hdr, setHdr] = React.useState(null);
    const [exr, setExr] = React.useState(null);
    const clientWidth = window.innerWidth * 0.1;
    const clientHeight = window.innerHeight * 0.1;
    const value = checkList1[id];
    const regexDiamond = new RegExp(`\\b${value}(?=_)|\\b${value}\\b|${value}`, 'i');

    const refMat = useRef(null)
    const refMesh = useRef(null)
    React.useEffect(() => {
        if(hdrTexture && exrTexture && scene && camera) {
            // chuyển đi.........
            scene.environment = hdrTexture
            scene.background = hdrTexture;

  // console.log(value,`\\b${value}\\b`,child.name,regexDiamond.test(child.name))
  model.traverse((child) => {
    if (child.type === "Mesh") {
        console.log(child.name)
        if (regexDiamond.test(child.name)) {
            // Dispose old geometry and material before creating new ones
            if (child.geometry) child.geometry.dispose();
            
            if (child.material) {
              
                child.material.dispose();
                if (child.material.envMap) {
                    child.material.envMap.dispose();
                }

            }

            // Create new geometry and material
            let meshdf = makeDiamond(child.geometry, scene, camera, clientWidth, clientHeight, hdrTexture);
       //     child.geometry = meshdf.geometry;
            child.material = meshdf.material;

            // Dispose the new mesh resources
            meshdf.geometry.dispose();
            if (meshdf.material) {
                meshdf.material.dispose();
                if (meshdf.material.envMap) {
                    meshdf.material.envMap.dispose();
                }
            }

            meshdf = null;
        } else {
            // Dispose old material
            if (child.material) {
                child.material.dispose();
                if (child.material.envMap) {
                    child.material.envMap.dispose();
                }
            }

            // Create new material
            let matdf = new THREE.MeshStandardMaterial({
                roughness: 0.1,
                metalness: 1, 
                envMap: exrTexture,        
                color: color.gold           
            });

            child.material = matdf;

            // Dispose new material resources
            matdf.dispose();
            if (matdf.envMap) {
                matdf.envMap.dispose();
            }

            matdf = null;
        }
    }
});

        }
        return() => {
            if(refMat.current) {
                refMat.current.dispose()
                refMat.current = null
            }
            if(refMesh.current) {
                if(refMesh.current.geometry) {
                    refMesh.current.geometry.dispose()
                } 
                if(refMesh.current.material) {
                    refMesh.current.material.dispose()
                }
                refMesh.current = null
            }
        }
    }, [hdrTexture, exrTexture, scene, camera])

    React.useEffect(() => {
        if (priRefSam.current) priRefSam.current.rotation.x = -5

        return () => {
            model.traverse((child) => {
                if (child.type === "Mesh") {
              
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                    
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.map) mat.map.dispose();  
                                if (mat.envMap) mat.envMap.dispose(); 
                                mat.dispose(); 
                            });
                        } else {
                            if (child.material.map) child.material.map.dispose();
                            if (child.material.envMap) child.material.envMap.dispose();
                            child.material.dispose();
                        }
                    }
                    
                }
            })

            if(refMat.current) {
                refMat.current.dispose()
                refMat.current = null
            }
            if(refMesh.current) {
                if(refMesh.current.geometry) {
                    refMesh.current.geometry.dispose()
                } 
                if(refMesh.current.material) {
                    refMesh.current.material.dispose()
                }
                refMesh.current = null
            }

                if (priRefSam.current) priRefSam.current = null
        }
    }, [])


    return (
      
        <Resize>
        <primitive ref={priRefSam} object={model} />
        </Resize>

    )
}


