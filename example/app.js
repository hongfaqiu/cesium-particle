import { Particle3D, Vortex, getFileFields } from '../src/index';
import * as cesium_map from './map';
import { FieldsPanel, ValueRangePanel, OffsetPanel, VortexPanel, ControlPanel } from './gui';
import { colorTable } from './options';

// initialization
cesium_map.initMap('cesiumContainer');

let particleObj = null, working = false;
let fieldsPanel = new FieldsPanel("fieldsPanelContainer");
const valueRangePanel = new ValueRangePanel("valueRangePanelContainer");
const offsetPanel = new OffsetPanel("offsetPanelContainer");
const vortexPanel = new VortexPanel("vortexPanelContainer");
const controlPanel = new ControlPanel("panelContainer", userInput => {
  particleObj && particleObj.optionsChange(userInput);
});

const viewer = cesium_map.getViewer();

const userInput = controlPanel.getUserInput();

const fileInput = document.getElementById('fileInput');
const loadBtn = document.getElementById('load');
const generateDataBtn = document.getElementById('generateData');
const statechangeBtn = document.getElementById('statechange');
const removeBtn = document.getElementById('remove');

fileInput.onchange = function () {
  const file = fileInput.files[0];
  file && getFileFields(file).then(res => {
    let list = document.getElementById("fieldsPanelContainer");
    list.removeChild(list.childNodes[0]);
    fieldsPanel = new FieldsPanel("fieldsPanelContainer", res);
  })
}

// 加载demo.nc文件按钮
loadBtn.onclick = function () {
  if (fileInput.files[0] && viewer && !particleObj) {
    const file = fileInput.files[0];
    const fields = fieldsPanel.getUserInput();
    const valueRange = valueRangePanel.getUserInput();
    const offset = offsetPanel.getUserInput();
    particleObj = new Particle3D(viewer, {
      input: file,
      userInput,
      fields,
      valueRange,
      offset,
      colorTable: colorTable
    });
    particleObj.init().then(res => {
      console.log(particleObj.data)
      particleObj.show();
      statechangeBtn.disabled = false;
      removeBtn.disabled = false;
      loadBtn.disabled = true;
      generateDataBtn.disabled = true;
      statechangeBtn.innerText = '隐藏';
      working = true;
    }).catch(e => {
      particleObj.remove();
      particleObj = undefined;
      window.alert(e);
    })
  }
};

// 生成涡旋数据按钮
generateDataBtn.onclick = function () {
  const parameter = vortexPanel.getUserInput();
  if (parameter && viewer && !particleObj) {
    const jsonData = new Vortex(...parameter).data;
    particleObj = new Particle3D(viewer, {
      input: jsonData,
      userInput,
      colour: 'height',
      type: 'json',
      colorTable: colorTable
    });
    particleObj.init().then(res => {
      particleObj.show();
      statechangeBtn.disabled = false;
      removeBtn.disabled = false;
      loadBtn.disabled = true;
      generateDataBtn.disabled = true;
      statechangeBtn.innerText = '隐藏';
      working = true;
    }).catch(e => {
      particleObj.remove();
      particleObj = undefined;
      window.alert(e);
    })
  }
};

statechangeBtn.onclick = function () {
  if (particleObj) {
    !working ? particleObj.show() : particleObj.hide();
    !working ? statechangeBtn.innerText = '隐藏' : statechangeBtn.innerText = '显示';
    working = !working;
  }
}

removeBtn.onclick = function () {
  if (particleObj) {
    particleObj.remove();
    working = false;
    statechangeBtn.innerText = '显示'
    particleObj = null;
    statechangeBtn.disabled = true;
    removeBtn.disabled = true;
    loadBtn.disabled = false;
    generateDataBtn.disabled = false;
  }
}