

import dynamic from 'next/dynamic'

const ListSample = dynamic(
    () => import('../components/ListSample'),
    { ssr: false }
)
const LoadScript = dynamic(
    () => import('../components/LoadScript'),
    { ssr: false }
)
const CanvasWrapper = dynamic(
    () => import('../components/CanvasWrapper'),
    { ssr: false }
)
export default function ModuleApp() {
    return (
        <>
            <ListSample />
            <LoadScript />
            <CanvasWrapper />
        </>
    )
}
