
import dynamic from 'next/dynamic'

const ModuleSlider = dynamic(
  () => import('./src/ModuleSlider'),
  { ssr: false }
)
import ModuleSample from './src/ModuleSample'
export default function page() {
  return (
    <main>
       <ModuleSlider/>
    </main>
  )
}
