import netcdfjs from 'netcdfjs'
import * as Cesium from 'cesium/Cesium'
import { defaultFields } from './options'

export default (function () {
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
  
  var loadNetCDF = function (file, userFields) {

    let fields = defaultFields;
    for (let key in fields) {
      if (userFields[key]) {
        fields[key] = userFields[key];
      }
    }

    return new Promise(function (resolve) {
      // const { U, V, W, H, lon, lat, lev } = fields;
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
        var NetCDF = new netcdfjs(reader.result);
        data = {};

        let variables = NetCDF.header.variables.map(item => item.name);
        for (let key in fields) {
          let arr = [];
          if (fields[key] && variables.indexOf(fields[key]) === -1) {
            arr.push(fields[key]);
          }
          if (arr.length) {
            console.error("NetCDF file no such attribute: " + arr + '\n all variables are: ' + variables);
          }
        }

        var dimensions = arrayToMap(NetCDF.dimensions);
        data.dimensions = {
          lon: 1,
          lat: 1,
          lev: 1
        };
        ['lon', 'lat', 'lev'].map(key => {
          try {
            if (fields[key]) {
              data.dimensions[key] = dimensions[fields[key]].size;
              data[key] = {};
              data[key].array = new Float32Array(NetCDF.getDataVariable(key).flat());
              data[key].min = Math.min(...data[key].array);
              data[key].max = Math.max(...data[key].array);
            }
          } catch {
            throw new Error("NetCDF file no such attribute: " + fields[key]);
          }
        });

        ["U", "V", "W", "H"].map(key => {
          try {
            if (fields[key]) {
              var variables = arrayToMap(NetCDF.variables);
              var attributes = arrayToMap(variables[fields[key]].attributes);
              data[key] = {};
              data[key].array = new Float32Array(NetCDF.getDataVariable(fields[key]).flat());
              data[key].min = attributes['min'].value;
              data[key].max = attributes['max'].value;
            }
          } catch {
            throw new Error("NetCDF file no such attribute: " + fields[key]);
          }
        })

        if (!data.lev) {
          data.lev = {
            array: [0].flat(),
            min: 0,
            max: 0
          }
        }

        if (!fields['W']) {
          data.W = {
            array: new Float32Array(data.U.array.length),
            min: 0,
            max: 0
          }
        }

        if (!fields['H']) {
          data.H = {
            array: new Float32Array(data.U.array.length),
            min: 0,
            max: 0
          }
          if (fields['lev']) {
            const { lon, lat, lev } = data.dimensions;
            let arr = [];
            for (let i = 0; i < lev; i++) {
              for (let j = 0; j < lat; j++) {
                for (let k = 0; k < lon; k++) {
                  let index = i * (lon * lat) + j * lon + k;
                  data.H.array[index] = data.lev.array[i];
                }
              }
            }
            data.H.min = Math.min(...data.lev.array);
            data.H.max = Math.max(...data.lev.array);
          }
        }

        resolve(data);
      };

    });
  }

  var loadData = async function (input, type, fields, colorTable) {
    
    if (type === 'json') {
      data = input
    }
    else {
      await loadNetCDF(input, fields);
    }
    validIds = getValidIds()
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
