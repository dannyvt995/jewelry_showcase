"use client"
import * as THREE from 'three'





import { makeDiamond } from '../../../../utils/DiamondN8.js'
import { MeshRefractionMaterial, useTexture, useEnvironment } from '@react-three/drei'
import React from 'react'
import { RGBELoader, CubeTextureLoader, EXRLoader, TextureLoader } from 'three-stdlib';
import { useThree } from '@react-three/fiber';
import { useStoreAsset } from '../../../store/useStoreAsset.js';
const color = {
    gold: 16434308
}
const checkList1 = {
    "model1": "Diamond",
    "model2": "Diamond",
    "model3": "Diamond_Pear",
    "model4": "Diamond_Pear",
    "model5": "GG_Pear",
    "model6": "group5_polySurface",
    "model7": "GemOnCrv",
    "model8": "mesh_2",
    "model9": "Diamond_Pear",
    "model10": "Gems",

}
export default function HandleModel({ model, id }) {
    const { exrTexture, hdrTexture} = useStoreAsset();
    const { scene, camera } = useThree()
    const modelRef = React.useRef([])
    const priRef = React.useRef()
    const priRefSam = React.useRef()
    const [completeLoad, setCompleteLoad] = React.useState(false)
    const meshListRef = React.useRef([])
    const [hdr, setHdr] = React.useState(null);
    const [exr, setExr] = React.useState(null);
    const clientWidth = window.innerWidth * 0.1;
    const clientHeight = window.innerHeight * 0.1;



    React.useEffect(() => {
        if(hdrTexture && exrTexture && scene && camera) {
            scene.environment = hdrTexture
            scene.background = hdrTexture;
            model.traverse((child) => {
            
                if (child.type === "Mesh") {
                    //child.material = new THREE.MeshNormalMaterial()
                    ///console.log(child.name === checkList1[id]?true:false)
                    const value = checkList1[id];
                    const regexDiamond = new RegExp(`\\b${value}(?=_)|\\b${value}\\b|${value}`, 'i');
                    // console.log(value,`\\b${value}\\b`,child.name,regexDiamond.test(child.name))
                    if (regexDiamond.test(child.name)) {
                        const diamond = makeDiamond(child.geometry, scene, camera, clientWidth, clientHeight, hdrTexture);
                        child.geometry = diamond.geometry
                        child.material = diamond.material
                    } else {
                        child.material = new THREE.MeshStandardMaterial({
                            roughness: 0.1,
                            metalness: 1,
                            // map: textureRls, 
                            envMap: exrTexture,
                            //  metalnessMap: textureRls,         
                            color: color.gold           
                        });
                    }
    
    
                }
    
    
            });
        }
       
    }, [hdrTexture, exrTexture, scene, camera])

    React.useEffect(() => {
        if (priRefSam.current) priRefSam.current.rotation.x = 6

        return () => {
            if (priRefSam.current) priRefSam.current = null
        }
    }, [priRefSam])


    return (
        <>
            <primitive ref={priRefSam} object={model} />
        </>
    )
}


