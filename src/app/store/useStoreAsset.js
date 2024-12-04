import { create } from 'zustand';

export const useStoreAsset = create((set) => ({
  exrTexture: null,
  hdrTexture: null,
  areTexturesUpdated: false,
  setTextures: (textures) => set((state) => {
    const updatedState = { ...textures };

    // Kiểm tra nếu cả 2 texture đều đã được cập nhật
    const areTexturesUpdated = updatedState.exrTexture && updatedState.hdrTexture;

    return { 
      ...updatedState, 
      areTexturesUpdated 
    };
  }), 
}));
