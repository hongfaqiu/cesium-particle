export default class Vortex {
  constructor(pos, radiusX, radiusY, height, dx, dy, dz) {
    this.data = {}
    this.generateData(pos, radiusX, radiusY, height, dx, dy, dz);
  }

  generateData(pos, radiusX, radiusY, height, dx, dy, dz) {
    let data = {};
    let numX = Math.floor(radiusX / dx) * 2 + 1;
    let numY = Math.floor(radiusY / dy) * 2 + 1;
    let numZ = Math.floor(height / dz) ;
    data.dimensions = {
      lon: numX,
      lat: numY,
      lev: numZ
    }
    data.lon = this.generateDimensionData(numX, pos[0] - radiusX, dx)
    data.lat = this.generateDimensionData(numY, pos[1] - radiusY, dy)
    data.lev = this.generateDimensionData(numZ, 1, 1)

    let stepX = (numX - 1) / 2 / numZ;
    let stepY = (numY - 1) / 2 / numZ;
    let a = 0, b = 0;
    let center = [numX / 2, numY / 2];
    let arrU = [], arrV = [];
    for (let z = 0; z < numZ;z++) {
      a += stepX;
      b += stepY;
      for (let x = 0; x < numX;x++) {
        for (let y = 0; y < numY;y++) {
          let speedx = 0;
          let speedy = 0;
          let disX = x - center[0];
          let disY = y - center[0];
          if (this.ifInEllipse(disX, disY, a, b)) {
            let speed = this.computeSpeed(disX, disY, 10)
            speedx = speed.x;
            speedy = speed.y;
          }
          arrU.push(speedx);
          arrV.push(speedy);
        }
      }
    }
    data.U = {
      array: new Float32Array(arrU.flat()),
      max: Math.max(...arrU),
      min: Math.min(...arrU)
    }
    data.V = {
      array: new Float32Array(arrV.flat()),
      max: Math.max(...arrV),
      min: Math.min(...arrV)
    }
    this.data = data;
  }

  generateDimensionData(num, start, step) {
    start *= 100;
    step *= 100;
    let data = {}
    let arr = [], i = 0;
    while (i++ < num) {
      arr.push(start / 100)
      start += step;
    };
    data = {
      array: new Float32Array(arr.flat()),
      min: Math.min(...arr),
      max: Math.max(...arr)
    }
    return data;
  }

  getData() {
    return this.data;
  }

  computeSpeed(x, y, speed, clockwise = false) {
    if (x === 0 && y === 0) {
      return {
        x: 0,
        y: 0
      }
    }
    let symbol = clockwise ? 1 : -1
    return {
      y: -y * symbol / Math.sqrt(x * x + y * y) * speed,
      x: x * symbol / Math.sqrt(x * x + y * y) * speed
    }
  }

  ifInEllipse(x, y, a, b) {
    let bool = (1 - ((x * x) / (a * a) + (y * y) / (b * b))) >= 0
    return bool;
  }
}
