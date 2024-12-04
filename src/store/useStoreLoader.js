import { create } from 'zustand';
import {  GLTFLoader, DRACOLoader, EXRLoader } from 'three-stdlib';

const useLoaderStore = create(() => ({
  loaderModel: (() => {
    console.log("==> INIT LOADER MODEL ONCE TIME");
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
