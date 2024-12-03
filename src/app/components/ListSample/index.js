"use client"

import React, { useState, useRef, useEffect } from "react";

import { OrbitControls, PerspectiveCamera, Environment, AdaptiveDpr, View, Preload } from '@react-three/drei'
import s from './style.module.css'
import { Soda, Apple, Duck, Candy, Flash, Target } from '../../jewelrySpace/src/Models'
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import LoadSample from "../../jewelrySpace/src/LoadSample";
import { Bloom, Sepia, Scanline, Pixelation, N8AO, SSAO ,EffectComposer, Noise, ChromaticAberration ,DepthOfField} from '@react-three/postprocessing'
import { ViewBuffer, ViewEffectsWrapper, ViewPostProcessing } from "../../../utils/ViewEffectsComposerWrapper";
import { BlendFunction } from 'postprocessing'
import LoadControls from '../../jewelrySpace/src/LoadControls'
import SceneWrapper from '../../jewelrySpace/src/LoadControls'



const items = [
  { modelId: "model1", id: 1, content: "This is the content for Item 1" },
  { modelId: "model2", id: 2, content: "This is the content for Item 2" },
  { modelId: "model3", id: 3, content: "This is the content for Item 3" },
  { modelId: "model4", id: 4, content: "This is the content for Item 4" },
  { modelId: "model5", id: 5, content: "This is the content for Item 5" },
  { modelId: "model6", id: 6, content: "This is the content for Item 6" },
  { modelId: "model7", id: 7, content: "This is the content for Item 7" },
  { modelId: "model8", id: 8, content: "This is the content for Item 8" },
  { modelId: "model9", id: 9, content: "This is the content for Item 9" },
  { modelId: "model10", id: 10, content: "This is the content for Item 10" },
];



const ListSample = React.memo(() => {
  console.log("LiseItem render")

  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Sample List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer"
            onClick={() => openModal(item)}
          >
            <h2 className="text-2xl font-semibold text-gray-800">{item.title}</h2>
            <p className="mt-2 text-gray-600 text-sm">{item.content}</p>
          </div>
        ))}
      </div>


      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${s.modalView} bg-white p-8 rounded-xl shadow-2xl`}>
            <h2 className="text-3xl font-bold text-gray-800">{selectedItem.title}</h2>
            <p className="mt-4 text-gray-700">{selectedItem.content}</p>
            <ViewEffectsWrapper className={s.view} /* dpr={[1, 2]} */>

              <LoadControls />
              <LoadSample modelId={selectedItem.modelId} />
              <ViewPostProcessing multisampling={3} /* stencilBuffer={false} depthBuffer={false} */ disableNormalPass={true}>
               {/*  <Noise opacity={0.75} blendFunction={BlendFunction.OVERLAY} /> */}
                {/* <ChromaticAberration radialModulation={true} modulationOffset={0.4} offset={[0.01, 0.01]} /> */}
                <Bloom mipmapBlur levels={2} luminanceThreshold={.8} intensity={.5} />
              {/*   <N8AO color="black" aoRadius={12} intensity={50.15} /> */}
           {/*      <SSAO
    blendFunction={BlendFunction.MULTIPLY} // blend mode
    samples={30} // amount of samples per pixel (shouldn't be a multiple of the ring count)
    rings={4} // amount of rings in the occlusion sampling pattern
    distanceThreshold={1.0} // global distance threshold at which the occlusion effect starts to fade out. min: 0, max: 1
    distanceFalloff={0.0} // distance falloff. min: 0, max: 1
    rangeThreshold={0.5} // local occlusion range threshold at which the occlusion starts to fade out. min: 0, max: 1
    rangeFalloff={0.1} // occlusion range falloff. min: 0, max: 1
    luminanceInfluence={0.9} // how much the luminance of the scene influences the ambient occlusion
    radius={20} // occlusion sampling radius
    scale={0.5} // scale of the ambient occlusion
    bias={0.5} // occlusion bias
  /> */}
              </ViewPostProcessing>

            </ViewEffectsWrapper>

            <button
              onClick={closeModal}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

  )
})

export default ListSample