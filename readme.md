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

在``webpack.config.js``中添加对glsl文件的拷贝

```js
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
        { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
        { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
        // 拷贝glsl文件至静态资源文件夹下
        { from: path.join('node_modules/cesium-particle/src', 'glsl'), to: 'glsl' }
      ],
    }),
  ]
}
```

## 例子

```js
import { Particle3D, Vortex } from 'cesium-particle'
import * as Cesium from 'cesium'

// cesiumViewer对象
var viewer = new Cesium.Viewer(cesiumContainer, viewerOption);

// 粒子系统配置
var systemOptions = {
  particlesTextureSize: Math.ceil(Math.sqrt(64 * 64)),
  maxParticles: 64 * 64,
  particleHeight: 1000.0,
  fadeOpacity: 0.996,
  dropRate: 0.003,
  dropRateBump: 0.01,
  speedFactor: 1.0,
  lineWidth: 4.0
}

// 粒子颜色色带
var colorTable = [
    [0.015686,
    0.054902,
    0.847059],
    [0.125490,
    0.313725,
    1.000000]
  ]

// 第一种
// 加载.nc文件
var file=new ActiveXObject("demo.nc"); 
 // 从NetCDF3文件生成粒子系统对象
var particleObj = new Particle3D(viewer, {
  input: file
});

// 第二种
// 构建涡旋模型对象
var parameter = [ [120, 30, 100], 5, 5, 2000, 0.1, 0.1, 2000]; // [['lon', 'lat', 'lev'], 'radiusX', 'radiusY', 'height', 'dx', 'dy', 'dz']
var jsonData = new Vortex(...parameter).getData();
// 从json数据生成粒子系统对象
var particleObj2 = new Particle3D(viewer, {
    input: jsonData,
    type: 'json', // 必填
    userInput: systemOptions,
    colorTable: colorTable
  });

particleObj.start(); // 开始运行粒子系统

systemOptions.fadeOpacity = 0.900;
particleObj.optionsChange(systemOptions); // 更新粒子系统配置

particleObj.stop(); // 停止粒子系统
particleObj.remove(); // 移除粒子系统
```

## API

### ``new Particle3D(viewer, {input, type = 'nc', userInput = defaultParticleSystemOptions, colorTable = defaultColorTable})``

新建一个粒子系统对象，传入的参数包括(ceiusmviewer, {.nc矢量场文件或json对象, 传入的数据类型, 粒子系统配置项(默认为默认设置), 粒子颜色色带})

配置属性详解:

```js
let maxParticles = 64 * 64 ; // 必须为平方, 否则会报错
let particlesTextureSize = Math.ceil(Math.sqrt(maxParticles));
maxParticles = particlesTextureSize * particlesTextureSize;

// 默认的粒子运行参数
defaultParticleSystemOptions = { 
  particlesTextureSize, // 粒子纹理大小
  maxParticles, // 最大粒子数
  particleHeight: 1000.0, // 粒子高度
  fadeOpacity: 0.996, // 拖尾透明度
  dropRate: 0.003, // 粒子移动至下一个随机位置的时间
  dropRateBump: 0.01, // 粒子移动至下一个随机位置相对于粒子当前速度的速度百分比
  speedFactor: 1.0, // 粒子速度
  lineWidth: 4.0 // 线宽
}

// colorTalbe默认为白色，传入的数组为``[[r, g , b], [r, g, b], ...]``格式，对应粒子速度从慢到快
defaultColorTable = [[1.0, 1.0, 1.0]]; // 默认的颜色配置
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
