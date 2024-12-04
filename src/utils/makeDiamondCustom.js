import {
    MeshBVH,
    MeshBVHUniformStruct,
    SAH,
    MeshBVHVisualizer
} from '../lib/three-mesh-bvh@0.5.10';
import {Mesh,ShaderMaterial} from 'three'
import { vertDiamond, fragDiamond } from './glsl/diamondN8'
export const initBvhForDiamond = (geometry) => {
    const mergedGeometry = geometry;
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry.toNonIndexed(), { lazyGeneration: false, strategy: SAH });
    const collider = new Mesh(mergedGeometry);
    collider.boundsTree = mergedGeometry.boundsTree;

    
   
   
    collider.material.wireframe = true;
    collider.material.opacity = 0.5;
    collider.material.transparent = true;
    collider.visible = false;
   
    let  visualizer
    // visualizer = new MeshBVHVisualizer(collider, 20);
    // visualizer.visible = true;
    // visualizer.update();


    return {
        collider:collider,
        visualizer:visualizer ? visualizer : null
    }
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
        fragmentShader: fragDiamond,
      //  side:2
    })

    return material
}
