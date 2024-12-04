
import LoadModel from "../LoadModel";
import { Bloom, Sepia, Scanline, Pixelation, N8AO, SSAO ,EffectComposer, Noise, ChromaticAberration ,DepthOfField} from '@react-three/postprocessing'
import { ViewBuffer, ViewEffectsWrapper, ViewPostProcessing } from "../../utils/ViewEffectsComposerWrapper";
import { BlendFunction } from 'postprocessing'
import LoadControls from '../LoadControls'
import LoadGround from '../LoadGround'

import s from './style.module.css'
import { memo } from "react";
import { View } from "@react-three/drei";
function ViewDrei({ modelId }) {
    if(1===1) {
        return (
            <ViewEffectsWrapper className={s.view} /* dpr={[1, 2]} */>
                <LoadGround/>
                <LoadControls />
            
                <LoadModel modelId={modelId} />
                <ViewPostProcessing multisampling={0} /* stencilBuffer={false} depthBuffer={false} disableNormalPass={false} */>
                    {/*  <Noise opacity={0.75} blendFunction={BlendFunction.OVERLAY} /> */}
                    {/* <ChromaticAberration radialModulation={true} modulationOffset={0.4} offset={[0.01, 0.01]} /> */}
                    <Bloom /* mipmapBlur levels={2}  */luminanceThreshold={.4} intensity={.1} />
                    {/*   <N8AO color="black" aoRadius={12} intensity={50.15} /> */}
                </ViewPostProcessing>
    
            </ViewEffectsWrapper>
        )
    }else{
        return (
            <View className={s.view}>
    
                <LoadControls />
                <LoadModel modelId={modelId} />
             
    
            </View>
        )
    }
   
}
export default  memo(ViewDrei)