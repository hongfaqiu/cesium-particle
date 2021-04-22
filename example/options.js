const defaultVortexOptions = {
  lon: 120,
  lat: 20,
  lev: 100,
  radiusX: 5,
  radiusY: 5,
  height: 2000,
  dx: 0.1,
  dy: 0.1,
  dz: 2000,
}

const defaultParticleSystemOptions = {
  particlesTextureSize: Math.ceil(Math.sqrt(100 * 100)),
  maxParticles: 100 * 100,
  particleHeight: 1000.0,
  fadeOpacity: 0.950,
  dropRate: 0.003,
  dropRateBump: 0.01,
  speedFactor: 0.5,
  lineWidth: 4.0
}

export { defaultVortexOptions, defaultParticleSystemOptions }