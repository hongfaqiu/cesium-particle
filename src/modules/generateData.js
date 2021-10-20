export default class Vortex {
  constructor(pos, radiusX, radiusY, height, dx, dy, dz) {
    this.data = {}
    this.generateData(pos, radiusX, radiusY, height, dx, dy, dz);
  }

  generateData(pos, radiusX, radiusY, height, dx, dy, dz) {
    let data = {};
    let numX = Math.floor(radiusX / dx) * 2 + 1;
    let numY = Math.floor(radiusY / dy) * 2;
    let numZ = Math.floor(height / dz) ;
    data.dimensions = {
      lon: numX,
      lat: numY,
      lev: numZ
    }
    data.lon = this.generateDimensionData(numX, pos[0] - radiusX, dx)
    data.lat = this.generateDimensionData(numY, pos[1] - radiusY, dy)
    data.lev = this.generateDimensionData(numZ, pos[2] - height + dz, dz)

    // The NetCDF file is in the "data" folder, it should contains below variables:
    // U (lev, lat, lon) @min @max
    // V (lev, lat, lon) @min @max
    let stepX = (numX - 1) / 2 / numZ;
    let stepY = (numY) / 2 / numZ;
    let a = 0, b = 0;
    let center = [numX / 2, numY / 2];
    let arrU = [], arrV = [], arrW = [], arrH = [];
    let maxSpeed = 3;
    for (let z = 0; z < numZ; z++) {
      a += stepX;
      b += stepY;
      for (let y = 0; y < numY;y++) {
        for (let x = 0; x < numX;x++) {
          let speedx = 0;
          let speedy = 0;
          let speedz = 0;
          let disX = x - center[0];
          let disY = y - center[1];
          let particleHeight = 0;
          if (this.ifInEllipse(disX, disY, a, b) ) {
            // 上半部分涡旋速度方向取大圆，即可生成螺旋线
            let speed = disY < 0 ? this.computeSpeed(disX, disY, center[0], center[1], maxSpeed * (1 - z / numZ)) : this.computeSpeed(disX + 1, disY + 1, center[0], center[1], maxSpeed * (1 - z / numZ))
            speedx = speed.x;
            speedy = speed.y;
            speedz = speed.z;
            particleHeight = this.computeHeight(disX, disY, center[0], center[1], pos[2] - dz * z, dz);
          }
          arrU.push(speedx);
          arrV.push(speedy);
          arrW.push(speedz);
          arrH.push(particleHeight);
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
    data.W = {
      array: new Float32Array(arrW.flat()),
      max: Math.max(...arrW),
      min: Math.min(...arrW)
    }
    data.H = {
      array: new Float32Array(arrH.flat()),
      max: Math.max(...arrH),
      min: Math.min(...arrH)
    }
    this.data = data;
    return data;
  }

  generateDimensionData(num, start, step) {
    if (start < 0) {
      // ensure the longitude is in [0, 360]
      start = 360 + start;
    }
    start *= 100;
    step *= 100;
    let arr = [], i = 0;
    while (i++ < num) {
      arr.push(start / 100)
      start += step;
    };
    return {
      array: new Float32Array(arr.flat()),
      min: Math.min(...arr),
      max: Math.max(...arr)
    };
  }

  getData() {
    return this.data;
  }

  computeSpeed(x0, y0, a, b, speed, clockwise = false) {
    if (x0 === 0 && y0 === 0) {
      return {
        x: 0,
        y: 0
      }
    }
    let symbol = clockwise ? -1 : 1
    let k = Math.abs((a * a * y0) / (b * b * x0));
    let xx = Math.sign(x0);
    let yy = Math.sign(y0);
    let speed2 = (1 - ((x0 * x0 + y0 * y0) / (a * a + b * b)) ** 0.5) * speed; // interpolate speed
    return {
      x: -k * yy * symbol / Math.sqrt(1 + k * k) * speed2,
      y: 0.5 * xx * symbol / Math.sqrt(1 + k * k) * speed2,
      z: 0
    }
  }

  computeHeight(x0, y0, a, b, startz, dz) {
    let height = startz - (1 - ((x0 * x0 + y0 * y0) / (a * a + b * b))** 2) * dz; // 越靠近中心高度越小
    return height
  }

  ifInEllipse(x, y, a, b) {
    if (a <= 0 || b <= 0) {
      return false;
    }
    let bool = (1 - ((x * x) / (a * a) + (y * y) / (b * b))) >= 0
    return bool;
  }
}
