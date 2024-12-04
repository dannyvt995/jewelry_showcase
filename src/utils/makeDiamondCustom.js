import {
    MeshBVH,
    MeshBVHUniformStruct,
    SAH
} from '../lib/three-mesh-bvh@0.5.10';
import {Mesh,ShaderMaterial} from 'three'
import { vertDiamond, fragDiamond } from './glsl/diamondN8'
export const initBvhForDiamond = (geometry) => {
    geometry.boundsTree = new MeshBVH(geometry.toNonIndexed(), { lazyGeneration: false, strategy: SAH });
    const collider = new Mesh(geometry);
    collider.boundsTree = geometry.boundsTree;
    return collider
}

export const createMaterialDiamond = ({
    envMap,bounces,color,ior,correctMips
    ,projectionMatrixInv,viewMatrixInv,chromaticAberration,
    aberrationStrength,resolution
}) => {

    const material = new ShaderMaterial({
        uniforms: {
            envMap: { value: envMap },
            bvh: { value: new MeshBVHUniformStruct()},
            bounces: { value: bounces },
            color: { value: color },
            ior: { value: ior },
            correctMips: { value: correctMips },
            projectionMatrixInv: { value:projectionMatrixInv },
            viewMatrixInv: { value: viewMatrixInv },
            chromaticAberration: { value: chromaticAberration },
            aberrationStrength: { value: aberrationStrength },
            resolution: { value: resolution }
        },
        vertexShader: vertDiamond,
        fragmentShader: fragDiamond
    })

    return material
}
