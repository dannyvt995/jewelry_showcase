import { forwardRef, createContext, useImperativeHandle, useRef, useState, useEffect, useLayoutEffect, useContext } from 'react'
import { extend, applyProps, useFrame, useThree } from '@react-three/fiber'
import {
  WebGLPathTracer,
  FogVolumeMaterial,
  ShapedAreaLight as ShapedAreaLightImpl,
  PhysicalSpotLight as PhysicalSpotLightImpl,
  PhysicalCamera as PhysicalCameraImpl
} from 'three-gpu-pathtracer'

const context = createContext()

export function usePathtracer() {
  return useContext(context)
}

export function Pathtracer({
  children,
  maxSamples = 36,
  renderPriority = 1,
  bounces = 4,
  filteredGlossyFactor = 0,
  renderDelay = 0,
  fadeDuration = 0,
  minSamples = 1,
  dynamicLowRes = true,
  lowResScale = 0.25,
  textureSize = [1024, 1024],
  rasterizeScene = false,
  tiles = [3, 3]
}) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls)
  const size = useThree((state) => state.size)
  const [pathTracer] = useState(() => new WebGLPathTracer(gl))

  // Set up scene
  useLayoutEffect(() => {
    pathTracer.setScene(scene, camera)
  }, [scene, camera])

  // Update config
  useLayoutEffect(() => {
    applyProps(pathTracer, {
      bounces,
      filteredGlossyFactor,
      renderDelay,
      fadeDuration,
      minSamples,
      dynamicLowRes,
      lowResScale,
      rasterizeScene,
      textureSize,
      tiles
    })
  })

  // Render samples
  useFrame((state) => {
    if (pathTracer.samples <= maxSamples) {
      pathTracer.renderSample()
    }
  }, renderPriority)

  // Listen for changes
  useEffect(() => {
    if (controls) {
      const fn = () => pathTracer.updateCamera()
      controls.addEventListener('change', fn)
      return () => controls.removeEventListener('change', fn)
    }
  }, [controls])

  // Configure size
  useEffect(() => {
    pathTracer.updateCamera()
  }, [camera, size])

  return <context.Provider value={pathTracer}>{children}</context.Provider>
}

export const PhysicalCamera = /* @__PURE__ */ forwardRef(({ children, ...props }, ref) => {
  extend({ PhysicalCamera: PhysicalCameraImpl })

  const pathTracer = usePathtracer()
  const set = useThree(({ set }) => set)
  const camera = useThree(({ camera }) => camera)
  const size = useThree(({ size }) => size)
  const cameraRef = useRef(null)
  useImperativeHandle(ref, () => cameraRef.current, [])

  useLayoutEffect(() => {
    if (!props.manual) {
      cameraRef.current.aspect = size.width / size.height
    }
  }, [size, props])

  useLayoutEffect(() => {
    cameraRef.current.updateProjectionMatrix()
  })

  useLayoutEffect(() => {
    const oldCam = camera
    set(() => ({ camera: cameraRef.current }))
    return () => set(() => ({ camera: oldCam }))
  }, [cameraRef, set])

  useEffect(() => void pathTracer.updateCamera())

  return (
    <physicalCamera ref={cameraRef} {...props}>
      {children}
    </physicalCamera>
  )
})

export function PhysicalSpotLight(props) {
  extend({ PhysicalSpotLight: PhysicalSpotLightImpl })
  const pathTracer = usePathtracer()
  useEffect(() => void pathTracer.updateLights())
  return <physicalSpotLight {...props} />
}

export function ShapedAreaLight(props) {
  extend({ ShapedAreaLight: ShapedAreaLightImpl })
  const pathTracer = usePathtracer()
  useEffect(() => void pathTracer.updateLights())
  return <shapedAreaLight {...props} />
}

export function Fog({ children, density, color, emissive, emissiveIntensity, ...props }) {
 // extend({ FogVolumeMaterial })
  const pathTracer = usePathtracer()
  useEffect(() => void pathTracer.updateMaterials())
  return (
    <mesh {...props}>
      <planeGeometry />
      {children}
     {/*  <fogVolumeMaterial density={density} color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} /> */}
    </mesh>
  )
}
