import Cesium from 'cesium';

var demo = Cesium.defaultValue(demo, false);

const fileOptions = {
    dataDirectory: demo ? 'https://raw.githubusercontent.com/RaymanNg/3D-Wind-Field/master/data/' : '../data/',
    dataFile: "demo.nc",
    glslDirectory: demo ? '../wind-3d/glsl/' : 'glsl/'
}

const defaultParticleSystemOptions = {
    maxParticles: 64 * 64,
    particleHeight: 1000.0,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 1.0,
    lineWidth: 4.0
}

export { demo, fileOptions, defaultParticleSystemOptions };