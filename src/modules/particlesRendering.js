import CustomPrimitive from './customPrimitive'
import Util from './util'
import * as Cesium from 'cesium'

import { segmentDrawVert, fullscreenVert, screenDrawFrag, segmentDrawFrag, trailDrawFrag } from '../shader/shader.min';

export default class ParticlesRendering {
  constructor(context, data, userInput, viewerParameters, particlesComputing, colour) {
    this.colour = colour === 'height' ? true : false;
    this.createRenderingTextures(context, data);
    this.createRenderingFramebuffers(context);
    this.createRenderingPrimitives(context, data, userInput, viewerParameters, particlesComputing);
  }

  createRenderingTextures(context, data) {
    const colorTextureOptions = {
      context: context,
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      pixelFormat: Cesium.PixelFormat.RGBA,
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
    };
    const depthTextureOptions = {
      context: context,
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT
    };

    const colorTableTextureOptions = {
      context: context,
      width: data.colorTable.colorNum,
      height: 1,
      pixelFormat: Cesium.PixelFormat.RGB,
      pixelDatatype: Cesium.PixelDatatype.FLOAT,
      sampler: new Cesium.Sampler({
        minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
        magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR
      })
    };

    this.textures = {
      segmentsColor: Util.createTexture(colorTextureOptions),
      segmentsDepth: Util.createTexture(depthTextureOptions),

      currentTrailsColor: Util.createTexture(colorTextureOptions),
      currentTrailsDepth: Util.createTexture(depthTextureOptions),

      nextTrailsColor: Util.createTexture(colorTextureOptions),
      nextTrailsDepth: Util.createTexture(depthTextureOptions),
      colorTable: Util.createTexture(colorTableTextureOptions, data.colorTable.array)
    };
  }

  createRenderingFramebuffers(context) {
    this.framebuffers = {
      segments: Util.createFramebuffer(context, this.textures.segmentsColor, this.textures.segmentsDepth),
      currentTrails: Util.createFramebuffer(context, this.textures.currentTrailsColor, this.textures.currentTrailsDepth),
      nextTrails: Util.createFramebuffer(context, this.textures.nextTrailsColor, this.textures.nextTrailsDepth)
    }
  }

  createSegmentsGeometry(userInput) {
    const repeatVertex = 4;
    // 坐标系
    //  z
    //  | /y
    //  |/
    //  o------x
    var st = []; // 纹理数组 st坐标系，左下角被定义为(0,0), 右上角为(1,1)，用于传入到顶点着色器中指代粒子的位置
    for (var s = 0; s < userInput.particlesTextureSize; s++) {
      for (var t = 0; t < userInput.particlesTextureSize; t++) {
        for (var i = 0; i < repeatVertex; i++) {
          st.push(s / userInput.particlesTextureSize);
          st.push(t / userInput.particlesTextureSize);
        }
      }
    }
    st = new Float32Array(st);

    var normal = []; //法向数组
    // it is not normal itself, but used to control lines drawing
    const pointToUse = [-1, 1];
    const offsetSign = [-1, 1];
    for (var i = 0; i < userInput.maxParticles; i++) {
      normal.push(
        // (point to use, offset sign, not used component)
        -1, -1, 0,
        -1,  1, 0,
         1, -1, 0,
         1,  1, 0
      )
    }
    normal = new Float32Array(normal);

    var vertexIndexes = []; // 索引,一个粒子矩形由两个三角形组成
    for (var i = 0, vertex = 0; i < userInput.maxParticles; i++) {
      vertexIndexes.push(
        // 第一个三角形用的顶点
        vertex + 0, vertex + 1, vertex + 2,
        // 第二个三角形用的顶点
        vertex + 2, vertex + 1, vertex + 3
      )

      vertex += repeatVertex;
    }
    vertexIndexes = new Uint32Array(vertexIndexes);
    var geometry = new Cesium.Geometry({
      attributes: new Cesium.GeometryAttributes({
        st: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: st
        }),
        normal: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: normal
        }),
      }),
      indices: vertexIndexes
    });

    return geometry;
  }

  createRenderingPrimitives(context, data, userInput, viewerParameters, particlesComputing) {
    const that = this;
    this.primitives = {
      segments: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          st: 0, // When true, the vertex has a 2D texture coordinate attribute.
          // 32-bit floating-point. 2 components per attribute
          normal: 1 // When true, the vertex has a normal attribute (normalized), which is commonly used for lighting.
          // 32-bit floating-point. 3 components per attribute.
        },
        geometry: this.createSegmentsGeometry(userInput),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        uniformMap: {
          previousParticlesPosition: function () {
            return particlesComputing.particlesTextures.previousParticlesPosition;
          },
          currentParticlesPosition: function () {
            return particlesComputing.particlesTextures.currentParticlesPosition;
          },
          postProcessingPosition: function () {
            return particlesComputing.particlesTextures.postProcessingPosition;
          },
          particlesSpeed: function () {
            return particlesComputing.particlesTextures.particlesSpeed;
          },
          colorTable: function () {
            return that.textures.colorTable;
          },
          aspect: function () {
            return context.drawingBufferWidth / context.drawingBufferHeight;
          },
          H: function () {
            return data.H.array;
          },
          hRange: function () {
            return new Cesium.Cartesian2(data.H.min, data.H.max);
          },
          uSpeedRange: function () {
            return new Cesium.Cartesian2(data.U.min, data.U.max);
          },
          vSpeedRange: function () {
            return new Cesium.Cartesian2(data.V.min, data.V.max);
          },
          wSpeedRange: function () {
            return new Cesium.Cartesian2(data.W.min, data.W.max);
          },
          pixelSize: function () {
            return viewerParameters.pixelSize;
          },
          lineWidth: function () {
            return userInput.lineWidth;
          },
          particleHeight: function () {
            return userInput.particleHeight;
          },
          colour: function () {
            return that.colour;
          }
        },
        vertexShaderSource: new Cesium.ShaderSource({
          sources: [segmentDrawVert]
        }),
        fragmentShaderSource: new Cesium.ShaderSource({
          sources: [segmentDrawFrag]
        }),
        rawRenderState: Util.createRawRenderState({
          // undefined value means let Cesium deal with it
          viewport: undefined,
          depthTest: {
            enabled: true
          },
          depthMask: true
        }),
        framebuffer: this.framebuffers.segments,
        autoClear: true
      }),

      trails: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          position: 0, // When true, the vertex has a 3D position attribute.
          // 64-bit floating-point (for precision). 3 components per attribute.
          st: 1
        },
        geometry: Util.getFullscreenQuad(),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        uniformMap: {
          segmentsColorTexture: function () {
            return that.textures.segmentsColor;
          },
          segmentsDepthTexture: function () {
            return that.textures.segmentsDepth;
          },
          currentTrailsColor: function () {
            return that.framebuffers.currentTrails.getColorTexture(0);
          },
          trailsDepthTexture: function () {
            return that.framebuffers.currentTrails.depthTexture;
          },
          fadeOpacity: function () {
            return userInput.fadeOpacity;
          }
        },
        // prevent Cesium from writing depth because the depth here should be written manually
        vertexShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
          sources: [fullscreenVert]
        }),
        fragmentShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
          sources: [trailDrawFrag]
        }),
        rawRenderState: Util.createRawRenderState({
          viewport: undefined,
          depthTest: {
            enabled: true,
            func: Cesium.DepthFunction.ALWAYS // always pass depth test for full control of depth information
          },
          depthMask: true
        }),
        framebuffer: this.framebuffers.nextTrails,
        autoClear: true,
        preExecute: function () {
          // swap framebuffers before binding
          if (userInput.dynamic) {
            
            var temp;
            temp = that.framebuffers.currentTrails;
            that.framebuffers.currentTrails = that.framebuffers.nextTrails;
            that.framebuffers.nextTrails = temp;
          }

          // keep the framebuffers up to date
          that.primitives.trails.commandToExecute.framebuffer = that.framebuffers.nextTrails;
          that.primitives.trails.clearCommand.framebuffer = that.framebuffers.nextTrails;
        }
      }),

      screen: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          position: 0,
          st: 1
        },
        geometry: Util.getFullscreenQuad(),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        uniformMap: {
          trailsColorTexture: function () {
            return that.framebuffers.nextTrails.getColorTexture(0);
          },
          trailsDepthTexture: function () {
            return that.framebuffers.nextTrails.depthTexture;
          }
        },
        // prevent Cesium from writing depth because the depth here should be written manually
        vertexShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
          sources: [fullscreenVert]
        }),
        fragmentShaderSource: new Cesium.ShaderSource({
          defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
          sources: [screenDrawFrag]
        }),
        rawRenderState: Util.createRawRenderState({
          viewport: undefined,
          depthTest: {
            enabled: false
          },
          depthMask: true,
          blending: {
            enabled: true
          }
        }),
        framebuffer: undefined // undefined value means let Cesium deal with it
      })
    };
  }
}
