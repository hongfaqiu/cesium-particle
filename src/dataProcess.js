import netcdfjs from 'netcdfjs'
import * as Cesium from 'cesium/Cesium'
var DataProcess = (function () {
  var data;

  var loadNetCDF = function (file) {
    return new Promise(function (resolve) {
      const reader = new FileReader();
      // 用readAsText读取文件文件内容
      reader.readAsArrayBuffer(file);
      
      reader.onload = function () {
        var arrayToMap = function (array) {
          return array.reduce(function (map, object) {
            map[object.name] = object;
            return map;
          }, {});
        }
        console.log(reader.result);
        var NetCDF = new netcdfjs(reader.result);
        data = {};
        console.log(NetCDF);
        var dimensions = arrayToMap(NetCDF.dimensions);
        data.dimensions = {};
        data.dimensions.lon = dimensions['lon'].size;
        data.dimensions.lat = dimensions['lat'].size;
        data.dimensions.lev = dimensions['lev'].size;

        var variables = arrayToMap(NetCDF.variables);
        var uAttributes = arrayToMap(variables['U'].attributes);
        var vAttributes = arrayToMap(variables['V'].attributes);

        data.lon = {};
        data.lon.array = new Float32Array(NetCDF.getDataVariable('lon').flat());
        data.lon.min = Math.min(...data.lon.array);
        data.lon.max = Math.max(...data.lon.array);

        data.lat = {};
        data.lat.array = new Float32Array(NetCDF.getDataVariable('lat').flat());
        data.lat.min = Math.min(...data.lat.array);
        data.lat.max = Math.max(...data.lat.array);

        data.lev = {};
        data.lev.array = new Float32Array(NetCDF.getDataVariable('lev').flat());
        data.lev.min = Math.min(...data.lev.array);
        data.lev.max = Math.max(...data.lev.array);

        data.U = {};
        data.U.array = new Float32Array(NetCDF.getDataVariable('U').flat());
        data.U.min = uAttributes['min'].value;
        data.U.max = uAttributes['max'].value;

        data.V = {};
        data.V.array = new Float32Array(NetCDF.getDataVariable('V').flat());
        data.V.min = vAttributes['min'].value;
        data.V.max = vAttributes['max'].value;

        resolve(data);
      };

    });
  }

  var loadData = async function (input, type) {
    if (type === 'json') {
      data = input
      return data;
    }
    await loadNetCDF(input);
    console.log(data);
    return data;
  }

  var randomizeParticles = function (maxParticles, viewerParameters) {
    var array = new Float32Array(4 * maxParticles);
    for (var i = 0; i < maxParticles; i++) {
      array[4 * i] = Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y);
      array[4 * i + 1] = Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y);
      array[4 * i + 2] = Cesium.Math.randomBetween(data.lev.min, data.lev.max);
      array[4 * i + 3] = 0.0;
    }
    return array;
  }

  return {
    loadData: loadData,
    randomizeParticles: randomizeParticles
  };

})();
export {
  DataProcess
}
