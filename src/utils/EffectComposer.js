import { HalfFloatType, NoToneMapping, Vector2 } from 'three'
import React, { forwardRef, useMemo, useEffect, useLayoutEffect, createContext, useRef, useImperativeHandle } from 'react'
import { useThree, useFrame, useInstanceHandle } from '@react-three/fiber'
import {
  EffectComposer as EffectComposerImpl,
  RenderPass,
  EffectPass,
  NormalPass,
  DepthDownsamplingPass,
  Effect,
  Pass,
  EffectAttribute
} from 'postprocessing'
import { isWebGL2Available } from 'three-stdlib'

//import {N8AOPostPass } from "n8ao"

export const EffectComposerContext = createContext(null)
const isConvolution = (effect) => (effect.getAttributes() & EffectAttribute.CONVOLUTION) === EffectAttribute.CONVOLUTION

export const EffectComposer = React.memo(
  forwardRef(
    (
      {
        children,
        camera: _camera,
        scene: _scene,
        resolutionScale,
        enabled = true,
        renderPriority = 1,
        autoClear = true,
        depthBuffer,
        enableNormalPass,
        stencilBuffer,
        multisampling = 8,
        frameBufferType = HalfFloatType
      },
      ref
    ) => {
      const { gl, scene: defaultScene, camera: defaultCamera, size } = useThree()
      const scene = _scene || defaultScene
      const camera = _camera || defaultCamera

      const [composer, normalPass, downSamplingPass] = useMemo(() => {
        const webGL2Available = isWebGL2Available()
        const effectComposer = new EffectComposerImpl(gl, {
          depthBuffer,
          stencilBuffer,
          multisampling: multisampling > 0 && webGL2Available ? multisampling : 0,
          frameBufferType
        })

        effectComposer.addPass(new RenderPass(scene, camera))

       


        let downSamplingPass = null
        let normalPass = null
        if (enableNormalPass) {
          normalPass = new NormalPass(scene, camera)
          normalPass.enabled = false
          effectComposer.addPass(normalPass)
          if (resolutionScale !== undefined && webGL2Available) {
            downSamplingPass = new DepthDownsamplingPass({ normalBuffer: normalPass.texture, resolutionScale })
            downSamplingPass.enabled = false
            effectComposer.addPass(downSamplingPass)
          }
        }
      //   const n8aopass = new N8AOPostPass(
      //     scene,
      //     camera,
      //     window.innerWidth,
      //     window.innerHeight
      // );
      // effectComposer.addPass(n8aopass)
        return [effectComposer, normalPass, downSamplingPass]
      }, [camera, gl, depthBuffer, stencilBuffer, multisampling, frameBufferType, scene, enableNormalPass, resolutionScale])

      const glSize = new Vector2()
      gl.getSize(glSize)

      useEffect(() => composer?.setSize(glSize.width, glSize.height), [composer, glSize.width, glSize.height])

      useFrame(
        (_, delta) => {
          if (enabled) {
            const currentAutoClear = gl.autoClear
            gl.autoClear = autoClear
            if (stencilBuffer && !autoClear) gl.clearStencil()
            composer.render(delta)
            gl.autoClear = currentAutoClear
          }
        },
        enabled ? renderPriority : 0
      )

      const group = useRef(null)
      const instance = useInstanceHandle(group)
      useLayoutEffect(() => {
        const passes = []

        if (group.current && instance.current && composer) {
          const children = instance.current.objects

          for (let i = 0; i < children.length; i++) {
            const child = children[i]

            if (child instanceof Effect) {
              const effects = [child]

              if (!isConvolution(child)) {
                let next = null
                while ((next = children[i + 1]) instanceof Effect) {
                  if (isConvolution(next)) break
                  effects.push(next)
                  i++
                }
              }

              const pass = new EffectPass(camera, ...effects)
              passes.push(pass)
            } else if (child instanceof Pass) {
              passes.push(child)
            }
          }

          for (const pass of passes) composer?.addPass(pass)

          if (normalPass) normalPass.enabled = true
          if (downSamplingPass) downSamplingPass.enabled = true
        }

        return () => {
          for (const pass of passes) composer?.removePass(pass)
          if (normalPass) normalPass.enabled = false
          if (downSamplingPass) downSamplingPass.enabled = false
        }
      }, [composer, children, camera, normalPass, downSamplingPass, instance])

      useEffect(() => {
        const currentTonemapping = gl.toneMapping
        gl.toneMapping = NoToneMapping
        return () => {
          gl.toneMapping = currentTonemapping
        }
      }, [])

      const state = useMemo(
        () => ({ composer, normalPass, downSamplingPass, resolutionScale, camera, scene }),
        [composer, normalPass, downSamplingPass, resolutionScale, camera, scene]
      )

      useImperativeHandle(ref, () => composer, [composer])

      return (
        <EffectComposerContext.Provider value={state}>
          <group ref={group}>{children}</group>
        </EffectComposerContext.Provider>
      )
    }
  )
)
