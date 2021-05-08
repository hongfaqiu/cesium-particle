// the size of UV textures: width = lon, height = lat*lev
uniform sampler2D U; // eastward wind 
uniform sampler2D V; // northward wind
uniform sampler2D W; // upward wind
uniform sampler2D currentParticlesPosition; // (lon, lat, lev)

uniform vec3 dimension; // (lon, lat, lev)
uniform vec3 minimum; // minimum of each dimension
uniform vec3 maximum; // maximum of each dimension
uniform vec3 interval; // interval of each dimension

// used to calculate the wind norm
uniform vec2 uSpeedRange; // (min, max);
uniform vec2 vSpeedRange;
uniform vec2 wSpeedRange;
uniform float pixelSize;
uniform float speedFactor;

float speedScaleFactor = speedFactor * pixelSize;

varying vec2 v_textureCoordinates;

vec2 mapPositionToNormalizedIndex2D(vec3 lonLatLev) {
    // ensure the range of longitude and latitude
    lonLatLev.x = clamp(lonLatLev.x, minimum.x, maximum.x);
    lonLatLev.y = clamp(lonLatLev.y,  minimum.y, maximum.y);
    lonLatLev.z = clamp(lonLatLev.z,  minimum.z, maximum.z);

    vec3 index3D = vec3(0.0);
    index3D.x = (lonLatLev.x - minimum.x) / interval.x;
    index3D.y = (lonLatLev.y - minimum.y) / interval.y;
    // map the z-axis value to the nearest bit plane to ensure that the result is an integer
    index3D.z = ceil((lonLatLev.z - minimum.z) / interval.z); 

    // the st texture coordinate corresponding to (col, row) index
    // example
    // data array is [0, 1, 2, 3, 4, 5, 7, 8, 9], width = 2, height = 2, level = 2
    // the content of texture will be
    // t 1.0
    //    |  6 7
    //    |  4 5
    //    |  2 3
    //    |  0 1
    //   0.0------1.0 s

    vec2 index2D = vec2(index3D.x, index3D.z * dimension.y + index3D.y);
    vec2 normalizedIndex2D = vec2(index2D.x / dimension.x, index2D.y / (dimension.y * dimension.z));
    return normalizedIndex2D;
}

float getWindComponent(sampler2D componentTexture, vec3 lonLatLev) {
    vec2 normalizedIndex2D = mapPositionToNormalizedIndex2D(lonLatLev);
    float result = texture2D(componentTexture, normalizedIndex2D).r;
    return result;
}

float interpolateTexture(sampler2D componentTexture, vec3 lonLatLev) {
    float lon = lonLatLev.x;
    float lat = lonLatLev.y;
    float lev = lonLatLev.z;

    float lon0 = floor(lon / interval.x) * interval.x;
    float lon1 = lon0 + 1.0 * interval.x;
    float lat0 = floor(lat / interval.y) * interval.y;
    float lat1 = lat0 + 1.0 * interval.y;

    float lon0_lat0 = getWindComponent(componentTexture, vec3(lon0, lat0, lev));
    float lon1_lat0 = getWindComponent(componentTexture, vec3(lon1, lat0, lev));
    float lon0_lat1 = getWindComponent(componentTexture, vec3(lon0, lat1, lev));
    float lon1_lat1 = getWindComponent(componentTexture, vec3(lon1, lat1, lev));

    float lon_lat0 = mix(lon0_lat0, lon1_lat0, lon - lon0);
    float lon_lat1 = mix(lon0_lat1, lon1_lat1, lon - lon0);
    float lon_lat = mix(lon_lat0, lon_lat1, lat - lat0);
    return lon_lat;
}

vec3 linearInterpolation(vec3 lonLatLev) {
    // https://en.wikipedia.org/wiki/Bilinear_interpolation
    float u = interpolateTexture(U, lonLatLev);
    float v = interpolateTexture(V, lonLatLev);
    float w = interpolateTexture(W, lonLatLev);
    return vec3(u, v, w);
}

vec2 lengthOfLonLat(vec3 lonLatLev) {
    // unit conversion: meters -> longitude latitude degrees
    // see https://en.wikipedia.org/wiki/Geographic_coordinate_system#Length_of_a_degree for detail

    // Calculate the length of a degree of latitude and longitude in meters
    float latitude = radians(lonLatLev.y);

    float term1 = 111132.92;
    float term2 = 559.82 * cos(2.0 * latitude);
    float term3 = 1.175 * cos(4.0 * latitude);
    float term4 = 0.0023 * cos(6.0 * latitude);
    float latLength = term1 - term2 + term3 - term4;

    float term5 = 111412.84 * cos(latitude);
    float term6 = 93.5 * cos(3.0 * latitude);
    float term7 = 0.118 * cos(5.0 * latitude);
    float longLength = term5 - term6 + term7;

    return vec2(longLength, latLength);
}

vec3 convertSpeedUnitToLonLat(vec3 lonLatLev, vec3 speed) {
    vec2 lonLatLength = lengthOfLonLat(lonLatLev);
    float u = speed.x / lonLatLength.x;
    float v = speed.y / lonLatLength.y;
    float w = speed.z;
    vec3 windVectorInLonLatLev = vec3(u, v, w);

    return windVectorInLonLatLev;
}

vec3 calculateSpeedByRungeKutta2(vec3 lonLatLev) {
    // see https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods#Second-order_methods_with_two_stages for detail
    const float h = 0.5;

    vec3 y_n = lonLatLev;
    vec3 f_n = linearInterpolation(lonLatLev);
    vec3 midpoint = y_n + 0.5 * h * convertSpeedUnitToLonLat(y_n, f_n) * speedScaleFactor;
    vec3 speed = h * linearInterpolation(midpoint) * speedScaleFactor;

    return speed;
}

vec2 getRange(vec2 range) {
  float x1 = 0.0 - range.x;
  float x2 = range.y - 0.0;
  if(x1 < 0.0 || x2 < 0.0){
    return vec2(abs(x1), abs(x2));
  } else {
    return vec2(0.0, abs(max(x1, x2)));
  }
}

float calculateWindNorm(vec3 speed) {
    vec3 percent = vec3(0.0);
    vec2 uRange = getRange(uSpeedRange);
    vec2 vRange = getRange(vSpeedRange);
    vec2 wRange = getRange(wSpeedRange);
    if(length(speed.xyz) == 0.0){
      return 0.0;
    }

    percent.x = (abs(speed.x) - uRange.x) / (uRange.y - uRange.x);
    percent.y = (abs(speed.y) - vRange.x) / (vRange.y - vRange.x);
    if(wSpeedRange.y == wSpeedRange.x){
      percent.z = 0.0;
    } else {
      percent.z = (abs(speed.z) - wRange.x) / (wRange.y - wRange.x);
    }
    float norm = length(percent);

    return norm;
}

void main() {
    // texture coordinate must be normalized
    vec3 lonLatLev = texture2D(currentParticlesPosition, v_textureCoordinates).rgb;
    vec3 speedOrigin = linearInterpolation(lonLatLev);
    vec3 speed = calculateSpeedByRungeKutta2(lonLatLev);
    vec3 speedInLonLat = convertSpeedUnitToLonLat(lonLatLev, speed);

    vec4 particleSpeed = vec4(speedInLonLat, calculateWindNorm(speed / speedScaleFactor));
    // gl_FragColor = particleSpeed;
    gl_FragColor = vec4(speedInLonLat, calculateWindNorm(speedOrigin));
}