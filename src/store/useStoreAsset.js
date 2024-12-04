import { create } from 'zustand';

export const useStoreAsset = create((set) => ({
  exrTexture: null,
  hdrTexture: null,
  cubeMapTexture:null,
  areTexturesUpdated: false,
  setTextures: (textures) => set((state) => {
    const updatedState = { ...textures };

    // Kiểm tra nếu cả 2 texture đều đã được cập nhật
    const areTexturesUpdated = updatedState.exrTexture 
                      && updatedState.hdrTexture
                      && updatedState.cubeMapTexture
    

    return { 
      ...updatedState, 
      areTexturesUpdated 
    };
  }), 
}));
