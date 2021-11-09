import ParticleSystem from './particleSystem'
import DataProcess from './dataProcess'
import Util from './util'
import * as Cesium from 'cesium/Cesium'
import { defaultFields, defaultParticleSystemOptions, defaultColorTable } from './options'

export default class Particle3D {
  constructor(viewer, {
    input,
    type = 'nc',
    fields = defaultFields,
    userInput = defaultParticleSystemOptions,
    colorTable = defaultColorTable,
    colour = 'speed'
  }) {

    const that = this;
    var resized = false;

    this.moveStartFun = function () {
      if (that.primitives) {
        that.primitives.forEach(primitive => {
          primitive.show = false;
        })
      }
    }

    this.moveEndFun = function () {
      that.updateViewerParameters();
      that.particleSystem.applyViewerParameters(that.viewerParameters);
      if (that.primitives) {
        that.primitives.forEach(primitive => {
          primitive.show = true;
        })
      }
    }

    this.resizeFun = function () {
      resized = true;
      that.remove();
    }

    this.preRenderFun = function () {
      if (resized) {
        that.particleSystem.canvasResize(that.scene.context);
        resized = false;
        that.addPrimitives();
        if (that.primitives) {
          that.primitives.forEach(primitive => {
            primitive.show = true;
          })
        }
      }
    }

    this.viewer = viewer;
    this.scene = this.viewer.scene;
    this.camera = this.viewer.camera;
    this.userInput = userInput;
    this.input = input;
    this.colour = colour;
    this.type = type;
    this.fields = fields;
    this.colorTable = colorTable;
    this.primitives = [];

    this.viewerParameters = {
      lonRange: new Cesium.Cartesian2(),
      latRange: new Cesium.Cartesian2(),
      pixelSize: 0.0,
      lonDisplayRange: new Cesium.Cartesian2(),
      latDisplayRange: new Cesium.Cartesian2()
    };
    // use a smaller earth radius to make sure distance to camera > 0
    this.globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0);
  }

  async init() {
    try {
      let data = await DataProcess.loadData(this.input, this.type, this.fields, this.colorTable)
      this.data = data;
      this.updateViewerParameters();
      this.particleSystem = new ParticleSystem(this.scene.context, data,
        this.processUserInput(this.userInput), this.viewerParameters, this.colour);
      this.addPrimitives();
      return data;
    } catch (e) {
      throw (e);
    }
  }

  addPrimitives() {
    // the order of primitives.add() should respect the dependency of primitives
    this.primitives = [
      this.particleSystem.particlesComputing.primitives.calculateSpeed,
      this.particleSystem.particlesComputing.primitives.updatePosition,
      this.particleSystem.particlesComputing.primitives.postProcessingPosition,
      this.particleSystem.particlesRendering.primitives.segments,
      this.particleSystem.particlesRendering.primitives.trails,
      this.particleSystem.particlesRendering.primitives.screen,
    ]
    for (let primitive of this.primitives) {
      this.scene.primitives.add(primitive);
    }
  }

  updateViewerParameters() {
    var viewRectangle = this.camera.computeViewRectangle(this.scene.globe.ellipsoid);
    var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
    this.viewerParameters.lonRange.x = Math.max(lonLatRange.lon.min, this.data.lon.min);
    this.viewerParameters.lonRange.y = Math.min(lonLatRange.lon.max, this.data.lon.max);
    this.viewerParameters.latRange.x = Math.max(lonLatRange.lat.min, this.data.lat.min);
    this.viewerParameters.latRange.y = Math.min(lonLatRange.lat.max, this.data.lat.max);

    var pixelSize = this.camera.getPixelSize(
      this.globeBoundingSphere,
      this.scene.drawingBufferWidth,
      this.scene.drawingBufferHeight
    );

    if (pixelSize > 0) {
      this.viewerParameters.pixelSize = pixelSize;
    }
  }

  setupEventListeners() {
    this.camera.moveStart.addEventListener(this.moveStartFun);
    this.camera.moveEnd.addEventListener(this.moveEndFun);
    window.addEventListener("resize", this.resizeFun);
    this.scene.preRender.addEventListener(this.preRenderFun);
  }

  removeEventListeners() {
    this.camera.moveStart.removeEventListener(this.moveStartFun);
    this.camera.moveEnd.removeEventListener(this.moveEndFun);
    this.scene.preRender.removeEventListener(this.preRenderFun);
    window.removeEventListener("resize", this.resizeFun);
  }

  processUserInput(userInput) {
    // make sure maxParticles is exactly the square of particlesTextureSize
    const particlesTextureSize = Math.ceil(Math.sqrt(userInput.maxParticles));
    const maxParticles = particlesTextureSize * particlesTextureSize;
    return {
      ...this.userInput,
      ...userInput,
      particlesTextureSize,
      maxParticles
    }
  }

  optionsChange(userInput) {
    this.particleSystem.applyUserInput(this.processUserInput(userInput));
  }

  show() {
    let that = this;
    for (let primitive of that.primitives) {
      primitive.show = true;
    }
    that.setupEventListeners();
    var animate = function () {
      that.viewer.resize();
      that.viewer.scene.requestRender();
      that.animate = requestAnimationFrame(animate);
    }
    animate();
  }

  hide() {
    for (let primitive of this.primitives) {
      primitive.show = false;
    }
    this.viewer.scene.requestRender();
    this.removeEventListeners();
    window.cancelAnimationFrame(this.animate);
  }

  remove() {
    this.hide();
    for (let primitive of this.primitives) {
      this.scene.primitives.remove(primitive);
    }
  }
}