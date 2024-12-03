// src/store/useStore.js

import {create} from 'zustand';

export const useStoreAsset = create((set) => ({
    exrTexture: null,
    hdrTexture: null,
    setExrTexture: (texture) => set({ exrTexture: texture }),
    setHdrTexture: (texture) => set({ hdrTexture: texture }),
}));
