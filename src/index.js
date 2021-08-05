import Particle3D from './modules/particle3D';
import Vortex from './modules/generateData';
import netcdfjs from 'netcdfjs'

const getFileFields = file => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      // 用readAsText读取文件文件内容
      reader.readAsArrayBuffer(file);
      reader.onload = function () {
        var NetCDF = new netcdfjs(reader.result);
        let variables = NetCDF.header.variables.map(item => item.name);
        let dimensions = NetCDF.header.dimensions.map(item => item.name);
        resolve({variables, dimensions, raw: NetCDF});
      }
    } catch(e) {
      reject(e);
    }
  })
} 

export { Particle3D, Vortex, getFileFields };