const defaultVortexOptions = {
  lon: 120,
  lat: 20,
  lev: 2000,
  radiusX: 8,
  radiusY: 5,
  height: 2000,
  dx: 0.1,
  dy: 0.1,
  dz: 2000,
}

const defaultParticleSystemOptions = {
  particlesTextureSize: Math.ceil(Math.sqrt(64 * 64)),
  maxParticles: 64 * 64,
  particleHeight: 1000.0,
  fadeOpacity: 0.950, // how fast the particle trails fade on each frame
  dropRate: 0.003, // how often the particles move to a random place
  dropRateBump: 0.01, // drop rate increase relative to individual particle speed
  speedFactor: 0.5, // how fast the particles move
  lineWidth: 4.0
}

export { defaultVortexOptions, defaultParticleSystemOptions }