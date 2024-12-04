"use client"

import * as dat from 'dat.gui';
import * as THREE from 'three'
import { Resize } from '@react-three/drei'
import React, { useRef } from 'react'
import { useThree } from '@react-three/fiber';
import { useStoreAsset } from '../../store/useStoreAsset.js';


import { paramsMaterial, checkDiamond } from '../../data/all_props.js';

import { createMaterialGui } from '../../hooks/useMaterialGUI.js'
import { createMaterialDiamond, initBvhForDiamond } from '../../utils/makeDiamondCustom.js'

export default function HandleModel({ model, id }) {
    const { exrTexture, hdrTexture } = useStoreAsset();
    const { scene, camera } = useThree()

    const priRefSam = React.useRef()
    // const clientWidth = window.innerWidth * 0.1;
    // const clientHeight = window.innerHeight * 0.1;
    const clientWidth = 512;
    const clientHeight = 512;

    // console.log(value,`\\b${value}\\b`,child.name,regexDiamond.test(child.name))

    const refMatDefault = useRef(null)
    const refMatDiamond = useRef(null)
    React.useEffect(() => {
        const gui = new dat.GUI({ autoPlace: true });


        refMatDefault.current = new THREE.MeshStandardMaterial({
            roughness: paramsMaterial.metal.roughness.value,
            metalness: paramsMaterial.metal.metalness.value,
            envMap: paramsMaterial.metal.envMap.value,
            color: paramsMaterial.metal.color.value
        });

        refMatDiamond.current = createMaterialDiamond({
            envMap: hdrTexture,
            bounces: paramsMaterial.diamond.bounces.value,
            color: paramsMaterial.diamond.color.value,
            ior: paramsMaterial.diamond.ior.value,
            correctMips: false,
            projectionMatrixInv: camera.projectionMatrixInverse,
            viewMatrixInv: camera.matrixWorld,
            chromaticAberration: true,
            aberrationStrength: paramsMaterial.diamond.aberrationStrength.value,
            resolution: new THREE.Vector2(clientWidth, clientHeight)
        })



        createMaterialGui(gui, 'Metal', paramsMaterial.metal, refMatDefault);
        createMaterialGui(gui, 'Diamond', paramsMaterial.diamond, refMatDiamond);

       
        model.traverse((child) => {
            if (child.type === "Mesh") {
                console.log(child.name)
                if (child.material && child.material.dispose) {
                    child.material.dispose();
                }
                if (checkDiamond({
                    childName: child.name,
                    nameModel: id
                })) {
                    let colliderForThis = initBvhForDiamond(child.geometry)
                    refMatDiamond.current.uniforms.bvh.value.updateFrom(colliderForThis.collider.boundsTree);
                    child.material = refMatDiamond.current;

                    //scene.add(colliderForThis.visualizer)
                    bvhDispose(colliderForThis)
    
                } else {
                 child.material = refMatDefault.current;
                }
            }
        });

        return () => {
            if (gui) gui.destroy();
            if (refMatDefault.current) {
                disposeRefMaterial(refMatDefault.current)
                refMatDefault.current = null
            }
            if (refMatDiamond.current) {
                disposeRefMaterial(refMatDiamond.current)
                refMatDiamond.current = null
            }
            model.traverse((child) => {
                if (child.type === "Mesh") {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            disposeRefMaterial(child.material)
                        } else {
                            disposeRefMaterial(child.material)
                        }
                    }

                }
            })
        }
    }, [model])

    React.useEffect(() => {
     //   if (priRefSam.current) priRefSam.current.rotation.x = -5

        return () => {
            model.traverse((child) => {
                if (child.type === "Mesh") {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            disposeRefMaterial(child.material)
                        } else {
                            disposeRefMaterial(child.material)
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


const bvhDispose = (ref) => {
    if (ref) {
        ref.collider.geometry.dispose()
        ref.collider.material.dispose()
        ref.collider = null
        ref = null
    }
}

const disposeRefMaterial = (ref) => {
    if (ref) {
        ref.dispose();
        if (ref.uniforms && ref.uniforms.bvh.value) {
            ref.uniforms.bvh.value.bvhBounds.dispose();
            ref.uniforms.bvh.value.bvhContents.dispose();
            ref.uniforms.bvh.value.index.dispose();
            ref.uniforms.bvh.value.position.dispose();
        }
        if (ref.uniforms && ref.uniforms.envMap && ref.uniforms.envMap.dispose) {
            ref.uniforms.envMap.value.dispose();
            ref.uniforms.envMap.value = null;
        }
        if (ref.envMap) {
            ref.envMap.dispose();
            ref.envMap = null;
        }

    }
}