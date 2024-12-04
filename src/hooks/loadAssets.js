// src/hooks/useLoadTextures.js
"use client"
import { useEffect } from 'react';
import { useStoreAsset } from '../store/useStoreAsset';
import * as THREE from 'three';
import useLoaderStore from '../store/useStoreLoader'
export const useLoadTextures = () => {
    const loaderExr = useLoaderStore((state) => state.loaderExr);
    const loaderCubeTexture = useLoaderStore((state) => state.loaderCubeTexture);
    const { setTextures } = useStoreAsset();

    useEffect(() => {
        const loadExrTexture = () => {
            return new Promise((resolve, reject) => {
                loaderExr.load(
                    '/ring/env/env-gem-002.exr',
                    (texture) => {
                        texture.mapping = THREE.EquirectangularReflectionMapping;
                        resolve({ exrTexture: texture });
                    },
                    undefined,
                    (error) => {
                        reject('Error loading EXR file:', error);
                    }
                );
            });
        };

        const loadHdrTexture = () => {
            return loaderExr.loadAsync('/ring/env/env-metal-008.exr').then((texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                return { hdrTexture: texture };
            });
        };
        const loadCubeMapTexture = () => {
            return loaderCubeTexture.setPath( '/ring/cubemap/' ).loadAsync([
                'px.png',
                'nx.png',
                'py.png',
                'ny.png',
                'pz.png',
                'nz.png'
              ]).then((texture) => {
               
                return { cubeMapTexture: texture };
            });
        };
        Promise.all([loadExrTexture(), loadHdrTexture(),loadCubeMapTexture()])
            .then(([exrResult, hdrResult,cubemapResult]) => {
                setTextures({
                    exrTexture: exrResult.exrTexture,
                    hdrTexture: hdrResult.hdrTexture,
                    cubeMapTexture:cubemapResult.cubeMapTexture
                });
                console.log("==> Textures load complete");
            })
            .catch((error) => {
                console.error(error);
            });

       
        return () => {
            console.log("Clean up useLoadTextures");
        };
    }, [loaderExr,setTextures,loaderCubeTexture]);

};
