
import LoadModel from "../../jewelryModuleProgress/LoadModel";
import { Bloom, Sepia, Scanline, Pixelation, N8AO, SSAO ,EffectComposer, Noise, ChromaticAberration ,DepthOfField} from '@react-three/postprocessing'
import { ViewBuffer, ViewEffectsWrapper, ViewPostProcessing } from "../../../utils/ViewEffectsComposerWrapper";
import { BlendFunction } from 'postprocessing'
import LoadControls from '../../jewelryModuleProgress/LoadControls'
import SceneWrapper from '../../jewelryModuleProgress/LoadControls'
import s from './style.module.css'
import { memo } from "react";
function ViewDrei({ modelId }) {
    return (
        <ViewEffectsWrapper className={s.view} /* dpr={[1, 2]} */>

            <LoadControls />
            <LoadModel modelId={modelId} />
            <ViewPostProcessing multisampling={1} stencilBuffer={false} depthBuffer={false} disableNormalPass={false}>
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
    )
}
export default  memo(ViewDrei)