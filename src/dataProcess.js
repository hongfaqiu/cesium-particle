import netcdfjs from 'netcdfjs'
import * as Cesium from 'cesium/Cesium'
import defaultColorTable from './colorTable'
var DataProcess = (function () {
  var data;
  var validIds = [];

  var loadColorTable = function (colorTable) {
    let colorNum = colorTable.length;
    let arr = [];
    colorTable.map(color => {
      arr = arr.concat(color);
    })
    data.colorTable = {
      colorNum,
      array: new Float32Array(arr.flat())
    };
  }
  
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

        data.H = {
          array: new Float32Array(data.U.array.length),
          min: 0,
          max: 0
        }

        data.W = {
          array: new Float32Array(data.U.array.length),
          min: 0,
          max: 0
        }

        resolve(data);
      };

    });
  }

  var loadData = async function (input, type, colorTable) {
    if (type === 'json') {
      data = input
    }
    else {
      await loadNetCDF(input);
    }
    validIds = getValidIds()
    console.log(data);
    loadColorTable(colorTable);

    return data;
  }

  var getValidIds = function(){
    let newArr = [];
    for (let i in data.U.array) {
      if(data.U.array[i] && data.V.array[i]) newArr.push(i);
    }
    return newArr;
  }

  // 先找一个随机的不为零的像素点,以此像素点经纬度范围生成随机位置
  var getValidRange = function () {
    const dimensions = [data.dimensions.lon, data.dimensions.lat, data.dimensions.lev];
    const minimum = [data.lon.min, data.lat.min, data.lev.min];
    const maximum = [data.lon.max, data.lat.max, data.lev.max];
    const interval = [
        (maximum[0]- minimum[0]) / (dimensions[0]- 1),
        (maximum[1] - minimum[1]) / (dimensions[1] - 1),
        dimensions[2] > 1 ? (maximum[2] - minimum[2]) / (dimensions[2] - 1) : 1.0
    ];
    let id = validIds[Math.floor(Math.random() * validIds.length)];

    let z = Math.floor(id / (dimensions[0] * dimensions[1]));
    let left = id % (dimensions[0] * dimensions[1]);
    let y = Math.floor(left / dimensions[0]);
    let x = left % dimensions[0];

    let lon = Cesium.Math.randomBetween(minimum[0]+ x * interval[0], minimum[0]+ (x + 1) * interval[0])
    let lat = Cesium.Math.randomBetween(minimum[1] + (y - 1) * interval[1], minimum[1] + y * interval[1])
    // let lev = Cesium.Math.randomBetween(minimum[2] + (z - 1) * interval[2], minimum[2] + z * interval[2])
    let lev = data.H.array[id] || 0;
   /*  const middle = [(maximum[0] + minimum[0]) / 2, (maximum[1] + minimum[1]) / 2]
    console.log(lon - middle[0], lat - middle[1], lev); */
    return [lon, lat, lev]
  }
  
  var randomizeParticles = function (maxParticles, viewerParameters) {
    var array = new Float32Array(4 * maxParticles);
    for (var i = 0; i < maxParticles; i++) {
      let pos = getValidRange();
      array[4 * i] = pos[0];
      array[4 * i + 1] = pos[1];
      array[4 * i + 2] = pos[2];
      array[4 * i + 3] = 0.0;
    }
    /* for (var i = 0; i < maxParticles; i++) {
      array[4 * i] = Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y);
      array[4 * i + 1] = Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y);
      array[4 * i + 2] = Cesium.Math.randomBetween(data.lev.min, data.lev.max);
      array[4 * i + 3] = 0.0;
    } */
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
