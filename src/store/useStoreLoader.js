import { create } from 'zustand';
import {  GLTFLoader, DRACOLoader, EXRLoader, HDRCubeTextureLoader } from 'three-stdlib';

import { CubeTextureLoader } from 'three';

const useLoaderStore = create(() => ({
  loaderCubeTexture: (() => {
    console.log("==> INIT LOADER CubeTexture ONCE TIME");
    const loaderCubeTexture = new CubeTextureLoader()
    return loaderCubeTexture;
  })(),
  loaderHdr: (() => {
    console.log("==> INIT LOADER HDRCubeTextureLoader ONCE TIME");
    const loaderHdr = new HDRCubeTextureLoader()
    return loaderHdr;
  })(),
  loaderModel: (() => {
    console.log("==> INIT LOADER DRACO ONCE TIME");
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    return gltfLoader;
  })(),
  loaderExr: (() => {
    console.log("==> INIT LOADER EXR ONCE TIME");
    const loaderExr = new EXRLoader();
    return loaderExr;
  })(),
}));

export default useLoaderStore;
