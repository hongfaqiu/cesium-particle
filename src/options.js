
const fileOptions = {
    dataDirectory: '../data/',
    dataFile: "demo.nc",
    glslDirectory: 'glsl/'
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

export { fileOptions, defaultParticleSystemOptions };