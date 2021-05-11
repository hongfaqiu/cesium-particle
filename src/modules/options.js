const defaultColorTable = [
  [[1.0, 1.0, 1.0]]
]

const defaultParticleSystemOptions = {
    particlesTextureSize: Math.ceil(Math.sqrt(64 * 64)),
    maxParticles: 64 * 64,
    particleHeight: 1000.0,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 1.0,
    lineWidth: 4.0
}

export { defaultColorTable, defaultParticleSystemOptions };