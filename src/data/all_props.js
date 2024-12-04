import { Vector3,Color } from "three"
export const paramsMaterial = {
    metal : {
        color: {
            value:16434308,
            type:"vec3"
        },
        useEnvMap: {
            value:false,
            type:"bool"
        },
        roughness:{
            value:0.1,
            range:[0,1],
            type:"float"
        },
        metalness:{
            value:1,
            range:[0,1],
            type:"float"
        },
        envMap:{
            value:null,
            type:"texture"
        }
    },
    diamond: {
        
        color: {
            value:new Color(1, 1, 1),
            type:"vec3"
        },
        ior: {
            value:2.4,
            range:[0,5],
            type:"float"
        },
        bounces:{
            value:3,
            range:[0,5],
            type:"int"
        },
        aberrationStrength:{
            value:0.01,
            range:[0,0.5],
            type:"float"
        }
    }
}
export  const listModels = [
    { modelId: "model1", id: 1, content: "This is the content for Item 1" },
    { modelId: "model2", id: 2, content: "This is the content for Item 2" },
    { modelId: "model3", id: 3, content: "This is the content for Item 3" },
    { modelId: "model4", id: 4, content: "This is the content for Item 4" },
    { modelId: "model5", id: 5, content: "This is the content for Item 5" },
    { modelId: "model6", id: 6, content: "This is the content for Item 6" },
    { modelId: "model7", id: 7, content: "This is the content for Item 7" },
    { modelId: "model8", id: 8, content: "This is the content for Item 8" },
    { modelId: "model9", id: 9, content: "This is the content for Item 9" },
    { modelId: "model10", id: 10, content: "This is the content for Item 10" },
    { modelId: "model11", id: 11, content: "This is the content for Item 11" },
    { modelId: "model12", id: 12, content: "This is the content for Item 12" },
  ];
  
export const checkListMesh = {
    "model1": "Diamond",
    "model2": "Diamond",
    "model3": "Brillant_",
    "model4": "GG_Round",
    "model5": "GG_Pear",
    "model6": "Round",
    "model7": "GemOnCrv",
    "model8": "mesh_2",
    "model9": "mesh_9",
    "model10": "Gems",
    "model11": "mesh_",
    "model12": "diamond_",
}

export const checkDiamond = ({childName,nameModel}) => {
    let isDiamond = false
    const value = checkListMesh[nameModel];
    const regexDiamond = new RegExp(`\\b${value}(?=_)|\\b${value}\\b|${value}`, 'i');
    // console.log(value,`\\b${value}\\b`,child.name,regexDiamond.test(child.name))

    if(regexDiamond.test(childName)) {
        isDiamond = true
    }else{
        isDiamond = false
    }
    return isDiamond
}