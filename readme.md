# 基于cesium的gpu加速粒子系统

## 说明

本模块改编自[RaymanNg大佬的风场demo](https://github.com/RaymanNg/3D-Wind-Field)。

加载的.nc文件属于NetCDF version 3数据文件。

本例使用的demo.nc文件分辨率28km，请参考这个网站上的数据 [Panoply](https://www.giss.nasa.gov/tools/panoply/)。

## 使用说明

node 环境下使用npm工具安装模块

```js
npm install --save cesium-particle
```

## 例子

```js
import { Particle3D, Vortex } from 'cesium-particle'
import * as Cesium from 'cesium'

// 默认的粒子系统配置
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
var viewer = new Cesium.Viewer(cesiumContainer, viewerOption);
var options = defaultParticleSystemOptions;
// 加载.nc文件
var file=new ActiveXObject("demo.nc"); 
var particleObj = new Particle3D(viewer, file, 'nc', options); // 加载NetCDF3文件
// 加载json数据
var parameter = [ [120, 30, 100], 5, 2000, 0.5, 0.5, 2000]; // [['lon', 'lat', 'lev'], 'radiusX', 'radiusY', 'height', 'dx', 'dy', 'dz']
var jsonData = new Vortex(...parameter).getData();
var particleObj2 = new Particle3D(viewer, jsonData, 'json', options);

particleObj.start(); // 开始运行粒子系统

options.fadeOpacity = 0.900;
particleObj.optionsChange(options); // 更新粒子系统配置

particleObj.stop(); // 停止粒子系统
particleObj.remove(); // 移除粒子系统
```

## API

### ``new Particle3D(viewer, file, type, options(default))``

新建一个粒子系统对象，传入的参数包括(ceiusmviewer, .nc矢量场文件, 传入的数据类型, 粒子系统配置（默认为默认设置）)

配置属性详解:

```js
let maxParticles = 64 * 64 ; // 必须为平方, 否则会报错
let particlesTextureSize = Math.ceil(Math.sqrt(maxParticles));
maxParticles = particlesTextureSize * particlesTextureSize;

defaultParticleSystemOptions = {
  particlesTextureSize, // 粒子纹理大小
  maxParticles, // 最大粒子数
  particleHeight: 1000.0, // 粒子高度
  fadeOpacity: 0.996, // 拖尾透明度
  dropRate: 0.003, // 下降率
  dropRateBump: 0.01, // 下降颠簸率
  speedFactor: 1.0, // 粒子速度
  lineWidth: 4.0 // 线宽
}
```

### ``start()``

粒子系统开始运行，以requestAnimationFrame()的形式进行刷新，在窗口移动、大小变更、地球缩放、视点相机移动时粒子系统会暂停，停止操作后继续运行

### ``optinsChange(options)``

传入粒子系统配置参数，更新粒子运行状态

### ``stop()``

暂停运行粒子系统

### ``remove()``

从cesiumview中移除粒子系统

## Demo

### 运行说明

```js
npm run dev
```
