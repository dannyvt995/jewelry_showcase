// src/hooks/useLoadTextures.js
"use client"
import { useEffect } from 'react';
import { useStoreAsset } from '../store/useStoreAsset';
import * as THREE from 'three';
import { RGBELoader, CubeTextureLoader, EXRLoader, TextureLoader } from 'three-stdlib';
export const useLoadTextures = () => {
    const loaderExr = new EXRLoader();
    const { setExrTexture, setHdrTexture } = useStoreAsset();
    console.log("// Chỉ gọi một lần khi hook được gọi")
    useEffect(() => {
        // Tải exrTexture
        const loadExrTexture = () => {
            return new Promise((resolve, reject) => {
                loaderExr.load(
                    '/ring/env/env-metal-008.exr',
                    (texture) => {
                        texture.mapping = THREE.EquirectangularReflectionMapping;
                        setExrTexture(texture); // Lưu vào store
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        reject('Error loading EXR file:', error);
                    }
                );
            });
        };

        // Tải hdrTexture
        const loadHdrTexture = () => {
            return loaderExr.loadAsync('/ring/env/env-gem-002.exr').then((texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                setHdrTexture(texture); // Lưu vào store
                return texture;
            });
        };

        // Khởi tạo tải texture
        loadExrTexture().catch((error) => console.error(error));
        loadHdrTexture().catch((error) => console.error(error));

    }, []); 
};
