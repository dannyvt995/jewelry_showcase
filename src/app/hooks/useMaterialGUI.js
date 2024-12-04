

export  const createMaterialGui = (GUI,folderName, materialParams, refMaterial) => {
    const folder = GUI.addFolder(folderName);
    
    for (const key in materialParams) {
        if (materialParams.hasOwnProperty(key)) {
            const param = materialParams[key];

            // Kiểm tra kiểu dữ liệu và thêm GUI tương ứng
            if (param.type === "vec3") {
                console.log(key)
                folder.addColor(param, 'value').name(key).onChange(() => {
                    if(folderName === "Metal") refMaterial.current.color.set(param.value); 
                    if(folderName === "Diamond") refMaterial.current.uniforms.color.value.set(param.value);
                });
            } else if (param.type === "bool") {
                folder.add(param, 'value').name(key).onChange((value) => {
                    if(folderName === "Metal")  refMaterial.current[key] = value;
                    if (key === 'useEnvMap') {
                        if(folderName === "Metal") refMaterial.current.envMap = value ? exrTexture : null;
                      
                    }
                });
            } else if (param.type === "float") {
                folder.add(param, 'value', param.range[0], param.range[1]).name(key).onChange(() => {
                    if(folderName === "Metal") refMaterial.current[key] = param.value;
                    if(folderName === "Diamond") refMaterial.current.uniforms[key].value = param.value;
                });
            } else if (param.type === "int") {
                folder.add(param, 'value', param.range[0], param.range[1]).name(key).onChange(() => {
                    if(folderName === "Metal")  refMaterial.current[key] = Math.floor(param.value);
                    if(folderName === "Diamond")refMaterial.current.uniforms[key].value = Math.floor(param.value);
                });
            }/* else if (param.type === "texture") {
                folder.add(param, 'value').name('Env Map').onChange((value) => {
                    refMaterial.current.envMap = value ? exrTexture : null;
                });
            } */
        }
    }

    folder.open();
}; 