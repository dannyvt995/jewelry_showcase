"use client"
import * as THREE from 'three'
import { Resize } from '@react-three/drei'
import React, { useRef } from 'react'
import { useThree } from '@react-three/fiber';
import { useStoreAsset } from '../../../store/useStoreAsset.js';
import { vertDiamond, fragDiamond } from '../glsl/diamondN8.js'

import {
    MeshBVH,
    MeshBVHUniformStruct,
    SAH
} from '../../../../lib/three-mesh-bvh@0.5.10';
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
    const { exrTexture, hdrTexture } = useStoreAsset();
    const { scene, camera } = useThree()

    const priRefSam = React.useRef()
    const clientWidth = window.innerWidth * 0.1;
    const clientHeight = window.innerHeight * 0.1;

    const value = checkList1[id];
    const regexDiamond = new RegExp(`\\b${value}(?=_)|\\b${value}\\b|${value}`, 'i');
    // console.log(value,`\\b${value}\\b`,child.name,regexDiamond.test(child.name))

    const refMatDefault = useRef(null)
    const refMatDiamond = useRef(null)
    React.useEffect(() => {
        if (hdrTexture && exrTexture) {
            // chuyển đi.........
            scene.environment = hdrTexture
            scene.background = hdrTexture;

            refMatDefault.current = new THREE.MeshStandardMaterial({
                roughness: 0.1,
                metalness: 1,
                envMap: exrTexture,
                color: color.gold
            });


            model.traverse((child) => {
                if (child.type === "Mesh") {
                    //  console.log(child.name)
                    if (child.material && child.material.dispose) {
                        child.material.dispose();
                    }
                    if (regexDiamond.test(child.name)) {
                        let matDiamond = createShaderDiamond(child.geometry, camera, clientWidth, clientHeight, hdrTexture)

                        if (child.material && child.material.dispose) {
                            child.material.dispose();
                        }
                        child.material = matDiamond;
                        matDiamond.dispose()
                
                        // matDiamond.uniforms.envMap.value.dispose()
                        // matDiamond.uniforms.envMap.value = null
                        matDiamond = null
                    } else {

                        child.material = refMatDefault.current;
                    }
                }
            });

        }
        return () => {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            disposeRefMaterial(refMatDiamond.current)
            refMatDiamond.current = null
            disposeRefMaterial(refMatDefault.current)
            refMatDefault.current = null
        }
    }, [hdrTexture, exrTexture,model])

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
                            if (child.material.uniforms && child.material.uniforms.envMap.value) {
                                child.material.uniforms.envMap.value.dispose();
                                child.material.uniforms.envMap.value = null;
                            }
                            if (child.material.uniforms && child.material.uniforms.bvh.value) {
                                child.material.uniforms.bvh.value.bvhBounds.dispose();
                                child.material.uniforms.bvh.value.bvhContents.dispose();
                                child.material.uniforms.bvh.value.index.dispose();
                                child.material.uniforms.bvh.value.position.dispose();
                            }
                            child.material.dispose();
                        }
                    }

                }
            })


            if (priRefSam.current) priRefSam.current = null
        }
    }, [])


    return (

        <Resize>
            <primitive ref={priRefSam} object={model} />
        </Resize>

    )
}

const initBvhForDiamond = (geometry) => {
    geometry.boundsTree = new MeshBVH(geometry.toNonIndexed(), { lazyGeneration: false, strategy: SAH });
    const collider = new THREE.Mesh(geometry);
    collider.boundsTree = geometry.boundsTree;
    return collider
}

const createShaderDiamond = (geometry, camera, clientWidth, clientHeight, hdrTexture) => {
    const collider = initBvhForDiamond(geometry)
    const COLOR = new THREE.Color(1, 1, 1)
    const IOR = 2.4
    const material = new THREE.ShaderMaterial({
        uniforms: {
            envMap: { value: hdrTexture },
            bvh: { value: new MeshBVHUniformStruct() },
            bounces: { value: 3 }, //3
            color: { value: COLOR },
            ior: { value: IOR },
            correctMips: { value: false },
            projectionMatrixInv: { value: camera.projectionMatrixInverse },
            viewMatrixInv: { value: camera.matrixWorld },
            chromaticAberration: { value: false },
            aberrationStrength: { value: 0.01 },
            resolution: { value: new THREE.Vector2(clientWidth, clientHeight) }
        },
        vertexShader: vertDiamond,
        fragmentShader: fragDiamond
    })
    material.uniforms.bvh.value.updateFrom(collider.boundsTree);
    return material
}

const disposeRefDiamond = (ref) => {
    if (ref) {
        if (ref.geometry) ref.geometry.dispose();
        if (ref.material) {
            ref.material.dispose();
            if (ref.material.uniforms.envMap) {
                ref.material.uniforms.envMap.value.dispose();
                ref.material.uniforms.envMap.value = null;
            }
            if (ref.material.envMap) {
                ref.material.envMap.dispose();
                ref.material.envMap = null;
            }
        }
        ref = null;
    }
}

const disposeRefMaterial = (ref) => {
    if (ref) {
        ref.dispose();
        if (ref.uniforms && ref.uniforms.envMap) {
            ref.uniforms.envMap.value.dispose();
            ref.uniforms.envMap.value = null;
        }
        if (ref.envMap) {
            ref.envMap.dispose();
            ref.envMap = null;
        }

    }
}