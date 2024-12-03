import { PerspectiveCamera,OrbitControls} from '@react-three/drei'
export default function LoadControls({...props}) {
  return (
  <>
  <PerspectiveCamera makeDefault zoom={1} position={[0, 0, 5]} />
  <OrbitControls />
  </>
  )
}
