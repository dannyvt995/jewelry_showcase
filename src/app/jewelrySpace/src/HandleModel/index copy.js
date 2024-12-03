"use client"
import * as THREE from 'three'





import {makeDiamond} from '../../../../utils/DiamondN8.js'
import { MeshRefractionMaterial, useTexture,useEnvironment } from '@react-three/drei'
import React from 'react'
import {RGBELoader , CubeTextureLoader } from 'three-stdlib';
import { useThree } from '@react-three/fiber';
const checkList = {
    "model1": ["Gem",
        "Gem 02",
        "Gem 03",
        "Metal 01"],
    "model2": [ "Material_5",
        "Metal 01",
        "Metal 02",
        "User Layer 01"],
    "model3": ["metal.011"],
    "model4": ["Predeterminado",
        "Gems"]

        ,
        "model5": ["Predeterminado",
            "Gems"],
            "model6": ["Predeterminado",
                "Gems"],
                "model7": ["Predeterminado",
                    "Gems"],
                    "model8": ["Predeterminado",
                        "Gems"],
                        "model9": ["Predeterminado",
                            "Gems"]
}

const checkList1 = {
    "model1" : "Diamond_Pear",
    "model2" : ["Prong",[1,19]],
    "model3" : "Diamond_Pear",
    "model4" : "Diamond_Pear",
    "model5" : "Diamond_Pear",
    "model6" : "Diamond_Pear",
    "model7" : "Diamond_Pear",
    "model8" : "Diamond_Pear",
    "model9" : "Diamond_Pear",
    "model10" : "Diamond_Pear",
  
}
export default function HandleModel({ model, id }) {
   
    const {scene,camera} = useThree()
    const modelRef = React.useRef([])
    const priRef = React.useRef()
    priRef.current = model
    const priRefSam = React.useRef()
    const [completeLoad, setCompleteLoad] = React.useState(false)
    const meshListRef = React.useRef([])
    const [hdr, setHdr] = React.useState(null);
    const hdrRef = React.useRef()
    const clientWidth = window.innerWidth * 0.99;
    const clientHeight = window.innerHeight * 0.98;



  //  const loader = new RGBELoader();
    const loader = new THREE.CubeTextureLoader();
    if(!hdr) {
        // loader.load(
        //     'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr',
        //     (texture) => {
    
        //         setHdr(texture)
        //     }
        // );

        loader
        .loadAsync([
          "/ring/skybox/Box_Right.bmp",
          "/ring/skybox/Box_Left.bmp",
          "/ring/skybox/Box_Top.bmp",
          "/ring/skybox/Box_Bottom.bmp",
          "/ring/skybox/Box_Front.bmp",
          "/ring/skybox/Box_Back.bmp",
        ])
        .then((texture) => {
            
          texture.encoding = THREE.sRGBEncoding;
          scene.environment = texture;
          scene.background = texture;
          setHdr(texture) 
        });
    }



    React.useEffect(() => {
      
        if (model) {
            let count = 0;  // Khởi tạo count
            const length = model.children[0].children.length;  // Đảm bảo lấy đúng chiều dài
            console.log(model)
            model.children[0].traverse((child) => {
        //     console.log(child)
                if(child.type === "Mesh"  /*  || child.isInstancedMesh === true */) {

                    
                    meshListRef.current.push(child.clone());  // Thêm phần tử vào danh sách
                    count++;
                 
                    if (count === 1) {
                        setCompleteLoad(true);  // Đánh dấu hoàn thành khi duyệt xong
                    }
                }
              
            });
        }

        return () => {
            if (modelRef.current) {
                modelRef.current = [];  // Xóa dữ liệu khi component unmount
            }
        };
    }, [model]);


    // React.useEffect(() => {
    //     if(priRefSam && hdr && model) {

    //         model.children[0].traverse((child) => {
    //           if(child.type === "Mesh") {
         
    //             child.material = new THREE.MeshPhongMaterial({envMap:hdr,color:"red"})
    //             if(child.name === "Diamond_Pear") {
    //                 const diamond = makeDiamond(child.geometry,scene,camera,clientWidth,clientHeight,hdr);
    //                   child = diamond.clone()
    //                 console.log(diamond)
    //             //  child.material = new THREE.MeshNormalMaterial()
    //             }
            
    //           }
       

    //         });

    //     }
    // },[priRefSam,hdr])

    React.useEffect(() => {
        // if(priRefSam && completeLoad && hdr) {

        //     priRefSam.current.children[0].traverse((child) => {  
        //         if(child.name === "Diamond_Pear") {
            
        //         console.log(diamond.material);   
        //     }
        //     });
        //     console.log(hdr,completeLoad); 
        // }


      //  if(hdr)  scene.background = hdr
        
    }, [completeLoad,hdr]);




    

    

    return completeLoad && hdr ? (
        <>
            <group name="MODEL_DATA">
                {meshListRef.current &&
                    meshListRef.current.map((me, i) => {
                        console.log(me)
                        if(me.isMesh !== undefined && !me.isMesh) {
                            return null
                        }

                        if(me.isMesh !== undefined && me.isMesh) {
                            if(me.name === checkList1[id] && typeof checkList1[id] === "string") { 
                                const diamond  = makeDiamond(me.geometry,scene,camera,clientWidth,clientHeight,hdr);
                                scene.add(diamond)
                                return null
                               }else if(typeof checkList1[id] === "array"){
                                    <mesh key={i} geometry={me.geometry}>
                                        <meshNormalMaterial/>
                                    </mesh>
                               }else{
                                return (
                                    <mesh key={i} geometry={me.geometry}>
                                        <meshNormalMaterial/>
                                    </mesh>
                                )
                            }
                        }
                       
                      
                    })}
            </group>
        </>
        ) : null;
   
   
//    return  <>
//     <primitive ref={priRefSam} object={model} />
//     <directionalLight position={[25, 25, 25]} intensity={5.5} color={0xfffff} />
//     <directionalLight position={[-25, -50, -25]} intensity={0.5} color={0xfffff} />
//     </>
}


