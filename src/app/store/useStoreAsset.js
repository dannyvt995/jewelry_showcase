import { create } from 'zustand';

export const useStoreAsset = create((set) => ({
  exrTexture: null,
  hdrTexture: null,
  setTextures: (textures) => set(() => ({ ...textures })), 
}));
