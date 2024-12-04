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

export const checkListMesh = {
    "model1": "Diamond",
    "model2": "Diamond",
    "model3": "Brillant_",
    "model4": "GG_Round",
    "model5": "GG_Pear",
    "model6": "Round",
    "model7": "GemOnCrv",
    "model8": "mesh_2",
    "model9": "mesh_56",
    "model10": "Gems",
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