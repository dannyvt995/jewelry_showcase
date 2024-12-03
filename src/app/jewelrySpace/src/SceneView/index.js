
import { AccumulativeShadows, Center, RandomizedLight } from '@react-three/drei'
import LoadSample from '../LoadSample'
export default function index({map}) {
    return (
        <group position={[0, -3, 0]}>
            <Center top>
                <LoadSample map={map} /* rotation={[-Math.PI / 2.05, 0, 0]} */ scale={1.2} />
            </Center>
     
            <AccumulativeShadows temporal frames={100} alphaTest={0.95} opacity={1} scale={20}>
                <RandomizedLight amount={8} radius={10} ambient={0.5} position={[0, 10, -2.5]} bias={0.001} size={3} />
            </AccumulativeShadows>
        </group>
    )
}
