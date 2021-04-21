import * as dat from 'dat.gui'

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

export default class Panel {
  constructor(optionsChange) {
    this.maxParticles = defaultParticleSystemOptions.maxParticles;
    this.particleHeight = defaultParticleSystemOptions.particleHeight;
    this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
    this.dropRate = defaultParticleSystemOptions.dropRate;
    this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
    this.speedFactor = defaultParticleSystemOptions.speedFactor;
    this.lineWidth = defaultParticleSystemOptions.lineWidth;
    
    const that = this;
    var onParticleSystemOptionsChange = function () {
      optionsChange(that.getUserInput());
    }


    window.onload = function () {
      var gui = new dat.GUI({ autoPlace: false });
      gui.add(that, 'maxParticles', 1, 256 * 256, 1).onFinishChange(onParticleSystemOptionsChange);
      gui.add(that, 'particleHeight', 1, 10000, 1).onFinishChange(onParticleSystemOptionsChange);
      gui.add(that, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(onParticleSystemOptionsChange);
      gui.add(that, 'dropRate', 0.0, 0.1).onFinishChange(onParticleSystemOptionsChange);
      gui.add(that, 'dropRateBump', 0, 0.2).onFinishChange(onParticleSystemOptionsChange);
      gui.add(that, 'speedFactor', 0.05, 8).onFinishChange(onParticleSystemOptionsChange);
      gui.add(that, 'lineWidth', 0.01, 16.0).onFinishChange(onParticleSystemOptionsChange);

      var panelContainer = document.getElementById('panelContainer');
      gui.domElement.classList.add('myPanel');
      panelContainer.appendChild(gui.domElement);
    };
  }
  
  getUserInput() {
    // make sure maxParticles is exactly the square of particlesTextureSize
    var particlesTextureSize = Math.ceil(Math.sqrt(this.maxParticles));
    this.maxParticles = particlesTextureSize * particlesTextureSize;

    return {
      particlesTextureSize: particlesTextureSize,
      maxParticles: this.maxParticles,
      particleHeight: this.particleHeight,
      fadeOpacity: this.fadeOpacity,
      dropRate: this.dropRate,
      dropRateBump: this.dropRateBump,
      speedFactor: this.speedFactor,
      lineWidth: this.lineWidth
    }
  }
}