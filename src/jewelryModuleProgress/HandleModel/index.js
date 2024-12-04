"use client"

import * as dat from 'dat.gui';
import * as THREE from 'three'
import { Resize } from '@react-three/drei'
import React, { useRef } from 'react'
import { useThree } from '@react-three/fiber';
import { useStoreAsset } from '../../store/useStoreAsset.js';


import { paramsMaterial, checkDiamond } from '../../data/all_props.js';

import { createMaterialGui } from '../../hooks/useMaterialGUI.js'
import { createMaterialDiamond, createMaterialDiamondFake, initBvhForDiamond } from '../../utils/makeDiamondCustom.js'
import useLoaderStore from '../../store/useStoreLoader.js';

export default function HandleModel({ model, id }) {
    const { exrTexture, hdrTexture, cubeMapTexture } = useStoreAsset();
    const { scene, camera } = useThree()
    const { loaderCubeTexture, loaderHdr } = useLoaderStore()
    const priRefSam = React.useRef()
    // const clientWidth = window.innerWidth * 0.1;
    // const clientHeight = window.innerHeight * 0.1;
    const clientWidth = 512;
    const clientHeight = 512;

    // console.log(value,`\\b${value}\\b`,child.name,regexDiamond.test(child.name))

    const refMatDefault = useRef(null)
    const refMatDiamond = useRef(null)

    const uniformsConfig = {
        //m4
        modelOffsetMatrixInv: { value: new THREE.Matrix4() },
        modelOffsetMatrix: { value: new THREE.Matrix4() },
        projectionMatrix: { value: camera.projectionMatrix },
        //v4
        envMapRotationQuat: { value: new THREE.Vector4(0, 0, 0, 1) },
        //v3
        centerOffset: { value: new THREE.Vector3(-0.0008, 0.0002, 0.2550) },
        color: { value: new THREE.Vector3(1, 1, 1) },
        colorCorrection: { value: new THREE.Vector3(1, 1, 1) },
        boostFactors: { value: new THREE.Vector3(1, 1, 1) },

        //f
        radius: { value: 1 },
        envMapIntensity: { value: 1 },
        transmission: { value: 0 },
        refractiveIndex: { value: 2.6 },
        rIndexDelta: { value: 0.0120 },
        squashFactor: { value: 0.9800 },
        geometryFactor: { value: 0.5000 },
        gammaFactor: { value: 1 },
        absorptionFactor: { value: 1 },
        envMapRotation: { value: 0 },
        reflectivity: { value: 0.5000 },
        //cubemap
        tCubeMapNormals: { value: cubeMapTexture },
        //sampler2D
        envMap: { value: exrTexture },//sampler2D
        transmissionSamplerMap: { value: hdrTexture },//sampler2D
    }


    React.useEffect(() => {
        const gui = new dat.GUI({ autoPlace: true });

        refMatDefault.current = new THREE.MeshStandardMaterial({
            roughness: paramsMaterial.metal.roughness.value,
            metalness: paramsMaterial.metal.metalness.value,
            envMap: paramsMaterial.metal.envMap.value,
            color: paramsMaterial.metal.color.value
        });
        createMaterialGui(gui, 'Metal', paramsMaterial.metal, refMatDefault);


        const useDiamondFake = true
        if (!useDiamondFake) {
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
            createMaterialGui(gui, 'Diamond', paramsMaterial.diamond, refMatDiamond);
        } else {
            refMatDiamond.current = createMaterialDiamondFake({
                uniforms: uniformsConfig
            })
        }





       
        


        model.traverse((child) => {
            if (child.type === "Mesh") {
                // console.log(child.name)
                if (child.material && child.material.dispose) {
                    child.material.dispose();
                }
                if (checkDiamond({
                    childName: child.name,
                    nameModel: id
                })) {
                    if (!useDiamondFake) {
                        let colliderForThis = initBvhForDiamond(child.geometry)
                        refMatDiamond.current.uniforms.bvh.value.updateFrom(colliderForThis.collider.boundsTree);

                        bvhDispose(colliderForThis)
                        child.material = refMatDiamond.current;

                    } else {

                        const modelOffsetMatrix = child.matrixWorld; // Ma trận thế giới của mô hình
                        const modelOffsetMatrixInv = new THREE.Matrix4().copy(modelOffsetMatrix).invert();
                        child.material = refMatDiamond.current;
                        child.material.uniforms.modelOffsetMatrix.value =  modelOffsetMatrix
                        child.material.uniforms.modelOffsetMatrixInv.value =  modelOffsetMatrixInv
                    }




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
        if (ref.uniforms && ref.uniforms.bvh && ref.uniforms.bvh.value) {
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