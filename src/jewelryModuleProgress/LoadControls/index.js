import { PerspectiveCamera,OrbitControls} from '@react-three/drei'
export default function LoadControls({...props}) {
  return (
  <>
  <PerspectiveCamera makeDefault zoom={1} position={[0, 0, 2]} near={0.01} far={1000} />
  <OrbitControls enableDamping={false} zoomSpeed={4}/>
  </>
  )
}
