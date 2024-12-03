import { useContext, useRef, useMemo, memo, useState, useEffect, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import { useFBO, ScreenQuad, View } from '@react-three/drei'
import { EffectComposer, EffectComposerContext } from './EffectComposer.js'

function calculateDpr(dpr) {
  // Err on the side of progress by assuming 2x dpr if we can't detect it
  // This will happen in workers where window is defined but dpr isn't.
  const target = typeof window !== 'undefined' ? window.devicePixelRatio ?? 2 : 1
  return Array.isArray(dpr) ? Math.min(Math.max(dpr[0], target), dpr[1]) : dpr
}

export const ViewBuffer = ({ children, index, renderTarget, element }) => {
  // const { composers } = useContext(ViewEffectsContext)

  const rootState = useThree()
  const composer = useMemo(() => {
    let composer = rootState.scene.userData.EffectComposer
    return composer
  }, [rootState.scene.userData.EffectComposer])

  useEffect(() => {
    // Connect the event layer to the tracking element
    const old = rootState.get().events.connected
    rootState.setEvents({ connected: element.current })
    return () => {
      rootState.setEvents({ connected: old })
    }
  }, [element])

  let oldAutoClear
  let oldXrEnabled
  let oldRenderTarget
  let oldIsPresenting
  let count = 0
  useFrame((state, delta) => {
    oldAutoClear = state.gl.autoClear
    oldXrEnabled = state.gl.xr.enabled
    oldRenderTarget = state.gl.getRenderTarget()
    oldIsPresenting = state.gl.xr.isPresenting
    state.gl.autoClear = true
    state.gl.xr.enabled = false
    state.gl.xr.isPresenting = false
    state.gl.setRenderTarget(renderTarget)
    if (composer) {
      for (const pass of composer.passes) {
        pass.render(composer.renderer, renderTarget, renderTarget, delta, false)
      }
    } else {
      state.gl.render(state.scene, state.camera)
    }
    state.gl.setRenderTarget(oldRenderTarget)
    state.gl.autoClear = oldAutoClear
    state.gl.xr.enabled = oldXrEnabled
    state.gl.xr.isPresenting = oldIsPresenting

    count++
  }, index + 1)
  return <>{children}</>
}

const ViewRenderer = ({ children, dpr, index, element, bufferScene }) => {
  const { viewport, size, performance } = useThree()
  const dprResolved = useMemo(
    () => (dpr ? calculateDpr(dpr) * performance.current : calculateDpr(viewport.initialDpr) * performance.current),
    [dpr, performance.current, viewport.initialDpr]
  )

  const renderTarget = useFBO(1, 1, {
    samples: 2
  })

  useLayoutEffect(() => {
    renderTarget.setSize(size.width * dprResolved, size.height * dprResolved)
  }, [dpr, viewport, size])

  return (
    <>
      {createPortal(
        <>
          <ViewBuffer index={index} renderTarget={renderTarget} element={element}>
            {children}
          </ViewBuffer>
          <group onPointerOver={() => null}></group>
        </>,
        bufferScene
      )}

      <ScreenQuad visible={true}>
        <shaderMaterial
          transparent
          premultipliedAlpha
          uniforms={{
            uTexture: { value: renderTarget.texture }
          }}
          vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = position.xy * 0.5 + 0.5;
            gl_Position = vec4(position, 1.0);
          }
        `}
          fragmentShader={`
          uniform sampler2D uTexture; 
          varying vec2 vUv;

          void main() {            
            gl_FragColor = texture2D(uTexture, vUv);
            #include <colorspace_fragment>          
          }
        `}
        />
      </ScreenQuad>
    </>
  )
}

export const ViewPostProcessingPasses = ({ children }) => {
  const { composer } = useContext(EffectComposerContext)
  const state = useThree()
  state.scene.userData.EffectComposer = composer

  composer.autoRenderToScreen = false
  useMemo(() => {
    for (const pass of composer.passes) {
      pass.renderToScreen = false
      pass.ignoreBackground = false
    }
  }, [composer.passes])

  return <>{children}</>
}

export const ViewPostProcessing = ({ children, index, ...props }) => {
  return (
    <>
      <EffectComposer enabled={false} {...props}>
        <ViewPostProcessingPasses>{children}</ViewPostProcessingPasses>
      </EffectComposer>
    </>
  )
}

export const ViewEffectsWrapper = ({ children, dpr, effects, addEffects = true, index = 1, ...props }) => {
  const ref = useRef()
  const [bufferScene] = useState(() => new THREE.Scene())

  return (
    <>
      <View {...props} ref={ref}>
        <ViewRenderer dpr={dpr} index={index} element={ref} bufferScene={bufferScene}>
          {children}
          {addEffects && effects ? (
            <ViewPostProcessing index={index} multisampling={0} stencilBuffer={false} depthBuffer={false}>
              {effects}
            </ViewPostProcessing>
          ) : (
            ''
          )}
        </ViewRenderer>
      </View>
    </>
  )
}

export const ViewEffectsPort = () => {
  return <View.Port />
}
