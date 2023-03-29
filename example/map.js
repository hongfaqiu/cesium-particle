import * as Cesium from 'cesium'
import "cesium/Build/Cesium/Widgets/widgets.css";

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGQwZTM2MC00NjkzLTRkZTgtYTU5MS0xZTA1NTljYWQyN2UiLCJpZCI6NTUwODUsImlhdCI6MTYyMDM5NjQ3NH0.lu_JBwyngYucPsvbCZt-xzmzgfwEKwcRXiYs5uV8uTM';
var viewer = null;

export var initMap = function (cesiumContainer) {
  viewer = new Cesium.Viewer(cesiumContainer, {
    terrainProvider: Cesium.createWorldTerrain(),
    baseLayerPicker: false,   //图层选择器
    animation: false,   //左下角仪表
    fullscreenButton: false,   //全屏按钮
    geocoder: false,   //右上角查询搜索
    infoBox: false,   //信息框
    homeButton: false,   //home按钮
    sceneModePicker: false,  //3d 2d选择器
    selectionIndicator: false,  //
    timeline: false,   //时间轴
    navigationHelpButton: false,  //右上角帮助按钮
  })
  
  viewer.camera.setView({//镜头的经纬度、高度。镜头默认情况下，在指定经纬高度俯视（pitch=-90）地球
    destination: Cesium.Cartesian3.fromDegrees(110.60396458865515, 34.54408834959379, 15000000),//北京15000公里上空
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: Cesium.Math.toRadians(0),
    },
  });
  let imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
  })
  viewer._cesiumWidget._creditContainer.style.display = "none";
  viewer.imageryLayers.addImageryProvider(imageryProvider);
  viewer.scene.fog.density = 0.0001; // 雾气中水分含量
  viewer.scene.globe.enableLighting = false;
  viewer.scene.skyBox.show = false;
  //显示刷新率和帧率
  viewer.scene.debugShowFramesPerSecond = true;
  
  if(Cesium.FeatureDetection.supportsImageRenderingPixelated()){//判断是否支持图像渲染像素化处理
    viewer.resolutionScale = window.devicePixelRatio;
  }
  //开启抗锯齿
  viewer.scene.fxaa = true;
  viewer.scene.postProcessStages.fxaa.enabled = true;
}

export var getViewer = function(){
  return viewer;
}