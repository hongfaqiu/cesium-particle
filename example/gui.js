import * as dat from 'dat.gui'
import { defaultVortexOptions, defaultParticleSystemOptions, defaultFields } from './options'

export class FieldsPanel {
  constructor(container, fields = {variables: ['U', 'V', 'W', 'H'], dimensions: ['lon', 'lat', 'lev']}) {
    this.options = defaultFields;
    
    const that = this;

    let gui = new dat.GUI({ autoPlace: false, closed: true });
    gui.add(that.options, 'U', fields.variables).name("横向速度U");
    gui.add(that.options, 'V', fields.variables).name("纵向速度V");
    gui.add(that.options, 'W', fields.variables).name("垂向速度W");
    gui.add(that.options, 'H', fields.variables).name("高度值H");
    gui.add(that.options, 'lon', fields.dimensions).name("经度lon");
    gui.add(that.options, 'lat', fields.dimensions).name("纬度lat");
    gui.add(that.options, 'lev', fields.dimensions).name("高度lev");

    let FieldsPanelContainer = document.getElementById(container);
    gui.domElement.classList.add('fieldsPanel');
    FieldsPanelContainer.appendChild(gui.domElement);
  }

  getUserInput() {
    return this.options;
  }
}
export class VortexPanel {
  constructor(container) {
    this.options = defaultVortexOptions;
    
    const that = this;

    let gui = new dat.GUI({ autoPlace: false, closed: true });
    gui.add(that.options, 'lon', -180, 180, 0.1).name("中心经度");
    gui.add(that.options, 'lat', -90, 90, 1).name("中心纬度");
    gui.add(that.options, 'lev', -10000, 10000, 100).name("中心高度");
    gui.add(that.options, 'radiusX', 0.0, 30).name("x半径(度)");
    gui.add(that.options, 'radiusY', 0, 30).name("y半径(度)");
    gui.add(that.options, 'height', 1, 10000).name("高度(米)");
    gui.add(that.options, 'dx', 0.001, that.options.radiusX).name("x半径下降率(度)");
    gui.add(that.options, 'dy', 0.001, that.options.radiusY).name("y半径下降率(度)");
    gui.add(that.options, 'dz', 1, 10000).name("高度下降率(米)");

    let vortexPanelContainer = document.getElementById(container);
    gui.domElement.classList.add('vortexPanel');
    vortexPanelContainer.appendChild(gui.domElement);
  }

  getUserInput() {
    let { lon, lat, lev, radiusX, radiusY, height, dx, dy, dz } = this.options;
    return [[lon, lat, lev], radiusX, radiusY, height, dx, dy, dz];
  }
}
export class ControlPanel {
  constructor(container, optionsChange) {
    this.options = defaultParticleSystemOptions;
    
    const that = this;
    let onParticleSystemOptionsChange = function () {
      optionsChange(that.getUserInput());
    }

    let gui = new dat.GUI({ autoPlace: false });
    gui.add(that.options, 'maxParticles', 1, 1000 * 1000, 1).name("最大粒子数").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'particleHeight', 1, 10000, 1).name("粒子高度").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'fadeOpacity', 0.50, 1.00, 0.001).name("拖尾透明度").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'dropRate', 0.0, 0.1).name("重置率").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'dropRateBump', 0, 0.2).name("重置&速度关联率").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'speedFactor', 0.01, 8).name("粒子速度").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'lineWidth', 0.01, 16.0).name("线宽").onFinishChange(onParticleSystemOptionsChange);
    gui.add(that.options, 'dynamic').name("动态运行").onFinishChange(onParticleSystemOptionsChange);

    let panelContainer = document.getElementById(container);
    gui.domElement.classList.add('controlPanel');
    panelContainer.appendChild(gui.domElement);
  }
  
  getUserInput() {
    // make sure maxParticles is exactly the square of particlesTextureSize
    let particlesTextureSize = Math.ceil(Math.sqrt(this.options.maxParticles));
    this.options.particlesTextureSize = particlesTextureSize;
    this.options.maxParticles = particlesTextureSize * particlesTextureSize;
    return this.options
  }
}