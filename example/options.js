const defaultVortexOptions = {
  lon: 130,
  lat: 24,
  lev: 1000000,
  radiusX: 2,
  radiusY: 2,
  height: 1000000,
  dx: 0.02,
  dy: 0.02,
  dz: 1000000,
}
const colorTable = [
  [0.015686,
  0.054902,
  0.847059],
  [0.125490,
  0.313725,
  1.000000],
  [0.254902,
  0.588235,
  1.000000],
  [0.427451,
  0.756863,
  1.000000],
  [0.525490,
  0.850980,
  1.000000],
  [0.611765,
  0.933333,
  1.000000],
  [0.686275,
  0.960784,
  1.000000],
  [0.807843,
  1.000000,
  1.000000],
  [1.000000,
  0.996078,
  0.278431],
  [1.000000,
  0.921569,
  0.000000],
  [1.000000,
  0.768627,
  0.000000],
  [1.000000,
  0.564706,
  0.000000],
  [1.000000,
  0.282353,
  0.000000],
  [1.000000,
  0.000000,
  0.000000],
  [0.835294,
  0.000000,
  0.000000],
  [0.619608,
  0.000000,
  0.000000]
]

const defaultParticleSystemOptions = {
  particlesTextureSize: Math.ceil(Math.sqrt(500 * 500)),
  maxParticles: 500 * 500,
  particleHeight: 1000.0,
  fadeOpacity: 0.950, // how fast the particle trails fade on each frame
  dropRate: 0.003, // how often the particles move to a random place
  dropRateBump: 0.01, // drop rate increase relative to individual particle speed
  speedFactor: 0.5, // how fast the particles move
  lineWidth: 4.0,
  dynamic: true
}

const defaultFields = {
  U: 'U',
  V: 'V',
  W: '',
  H: '',
  lon: 'lon',
  lat: 'lat',
  lev: '',
}

export { defaultVortexOptions, colorTable, defaultParticleSystemOptions, defaultFields }