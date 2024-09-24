import CustomPrimitive from './customPrimitive';
import DataProcess from './dataProcess';
import Util from './util';
import * as Cesium from 'cesium';
import { CalculateSpeedShader, UpdatePositionShader, PostProcessingPositionShader } from '../shader/shader.min';

export default class ParticlesComputing {
    constructor(context, data, userInput, viewerParameters) {
        this.createWindTextures(context, data);
        this.createParticlesTextures(context, userInput, viewerParameters);
        this.createComputingPrimitives(data, userInput, viewerParameters);
    }

    createWindTextures(context, data) {
        var windTextureOptions = {
            context: context,
            width: data.dimensions.lon,
            height: data.dimensions.lat * data.dimensions.lev,
            pixelFormat: Cesium.PixelFormat.RED,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            flipY: false,
            sampler: new Cesium.Sampler({
                // the values of texture will not be interpolated
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
            })
        };

        this.windTextures = {
            U: Util.createTexture(windTextureOptions, data.U.array),
            V: Util.createTexture(windTextureOptions, data.V.array),
            W: Util.createTexture(windTextureOptions, data.W.array),
            H: Util.createTexture(windTextureOptions, data.H.array)
        };
    }

  createParticlesTextures(context, userInput, viewerParameters) {
        var particlesTextureOptions = {
            context: context,
            width: userInput.particlesTextureSize,
            height: userInput.particlesTextureSize,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            flipY: false,
            sampler: new Cesium.Sampler({
                // the values of texture will not be interpolated
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
            })
        };
        var particlesArray = DataProcess.randomizeParticles(userInput.maxParticles, viewerParameters)
        var zeroArray = new Float32Array(4 * userInput.maxParticles).fill(0);

        this.particlesTextures = {
            previousParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            currentParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            nextParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            postProcessingPosition: Util.createTexture(particlesTextureOptions, particlesArray),

            particlesSpeed: Util.createTexture(particlesTextureOptions, zeroArray)
      };
    }

    destroyParticlesTextures() {
        Object.keys(this.particlesTextures).forEach((key) => {
            this.particlesTextures[key].destroy();
        });
    }

    createComputingPrimitives(data, userInput, viewerParameters) {
        const dimension = new Cesium.Cartesian3(data.dimensions.lon, data.dimensions.lat, data.dimensions.lev);
        const minimum = new Cesium.Cartesian3(data.lon.min, data.lat.min, data.lev.min);
        const maximum = new Cesium.Cartesian3(data.lon.max, data.lat.max, data.lev.max);
        const interval = new Cesium.Cartesian3(
            (maximum.x - minimum.x) / (dimension.x - 1),
            (maximum.y - minimum.y) / (dimension.y - 1),
            dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
        );
        const lonRange = new Cesium.Cartesian2(data.lon.min, data.lon.max);
        const latRange = new Cesium.Cartesian2(data.lat.min, data.lat.max);
        const uSpeedRange = new Cesium.Cartesian2(data.U.min, data.U.max);
        const vSpeedRange = new Cesium.Cartesian2(data.V.min, data.V.max);
        const wSpeedRange = new Cesium.Cartesian2(data.W.min, data.W.max);

        const that = this;

        this.primitives = {
            calculateSpeed: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    U: function () {
                        return that.windTextures.U;
                    },
                    V: function () {
                        return that.windTextures.V;
                    },
                    W: function () {
                        return that.windTextures.W;
                    },
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    dimension: function () {
                        return dimension;
                    },
                    minimum: function () {
                        return minimum;
                    },
                    maximum: function () {
                        return maximum;
                    },
                    interval: function () {
                        return interval;
                    },
                    uSpeedRange: function () {
                        return uSpeedRange;
                    },
                    vSpeedRange: function () {
                        return vSpeedRange;
                    },
                    wSpeedRange: function () {
                        return wSpeedRange;
                    },
                    speedScaleFactor: function () {
                        return viewerParameters.pixelSize * userInput.speedFactor;
                    },
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [CalculateSpeedShader]
                }),
                outputTexture: this.particlesTextures.particlesSpeed,
                preExecute: function () {
                    // swap textures before binding
                    if (userInput !== undefined && userInput.dynamic) {
                      var temp;
                      temp = that.particlesTextures.previousParticlesPosition;
                      that.particlesTextures.previousParticlesPosition = that.particlesTextures.currentParticlesPosition;
                      that.particlesTextures.currentParticlesPosition = that.particlesTextures.postProcessingPosition;
                      that.particlesTextures.postProcessingPosition = temp;
                    }

                    // keep the outputTexture up to date
                    that.primitives.calculateSpeed.commandToExecute.outputTexture = that.particlesTextures.particlesSpeed;
                }
            }),

            updatePosition: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    particlesSpeed: function () {
                        return that.particlesTextures.particlesSpeed;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [UpdatePositionShader]
                }),
                outputTexture: this.particlesTextures.nextParticlesPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.updatePosition.commandToExecute.outputTexture = that.particlesTextures.nextParticlesPosition;
                }
            }),

            postProcessingPosition: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    nextParticlesPosition: function () {
                        return that.particlesTextures.nextParticlesPosition;
                    },
                    particlesSpeed: function () {
                        return that.particlesTextures.particlesSpeed;
                    },
                    viewerLonRange: function () {
                        return viewerParameters.lonRange;
                    },
                    viewerLatRange: function () {
                        return viewerParameters.latRange;
                    },
                    lonRange: function () {
                        return lonRange;
                    },
                    latRange: function () {
                        return latRange;
                    },
                    dimension: function () {
                      return dimension;
                    },
                    minimum: function () {
                        return minimum;
                    },
                    maximum: function () {
                        return maximum;
                    },
                    interval: function () {
                        return interval;
                    },
                    H: function () {
                      return that.windTextures.H;
                    },
                    randomCoefficient: function () {
                        var randomCoefficient = Math.random();
                        return randomCoefficient;
                    },
                    dropRate: function () {
                        return userInput.dropRate;
                    },
                    dropRateBump: function () {
                        return userInput.dropRateBump;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [PostProcessingPositionShader]
                }),
                outputTexture: this.particlesTextures.postProcessingPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.postProcessingPosition.commandToExecute.outputTexture = that.particlesTextures.postProcessingPosition;
                }
            })
        }
    }

}
