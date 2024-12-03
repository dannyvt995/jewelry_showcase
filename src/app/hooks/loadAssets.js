// src/hooks/useLoadTextures.js
"use client"
import { useEffect } from 'react';
import { useStoreAsset } from '../store/useStoreAsset';
import * as THREE from 'three';
import useLoaderStore from '../store/useStoreLoader'
export const useLoadTextures = () => {
    const loader = useLoaderStore((state) => state.loaderExr);
    const { setTextures } = useStoreAsset();

    useEffect(() => {
        const loadExrTexture = () => {
            return new Promise((resolve, reject) => {
                loader.load(
                    '/ring/env/env-metal-008.exr',
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
            return loader.loadAsync('/ring/env/env-gem-002.exr').then((texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                return { hdrTexture: texture };
            });
        };

        Promise.all([loadExrTexture(), loadHdrTexture()])
            .then(([exrResult, hdrResult]) => {
                setTextures({
                    exrTexture: exrResult.exrTexture,
                    hdrTexture: hdrResult.hdrTexture,
                });
                console.log("==> Textures load complete");
            })
            .catch((error) => {
                console.error(error);
            });

       
        return () => {
            console.log("Clean up useLoadTextures");
        };
    }, [loader,setTextures]);

};
