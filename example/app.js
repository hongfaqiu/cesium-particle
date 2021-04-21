import { Particle3D, Vortex } from '@/index.js';
import * as ceiusm_map from './map';
import Panel from './gui';

// initialization
ceiusm_map.initMap('cesiumContainer');
var panel = new Panel(userInput => {
  particleObj && particleObj.optionsChange(userInput);
});

var viewer = ceiusm_map.getViewer();

var userInput = panel.getUserInput();

const fileInput = document.getElementById('fileInput');
const loadBtn = document.getElementById('load');
const generateDataBtn = document.getElementById('generateData');
const statechangeBtn = document.getElementById('statechange');
const removeBtn = document.getElementById('remove');
var particleObj = null, working = false;

window.addEventListener('particleSystemOptionsChanged', function () {
  if (particleObj) {
    that.particleSystem.applyUserInput(that.panel.getUserInput());
  }
});

loadBtn.onclick = function () {
  if (fileInput.files[0] && viewer && !particleObj) {
    let file = fileInput.files[0];
    particleObj = new Particle3D(viewer, file, 'nc', userInput);
    particleObj.start();
    statechangeBtn.disabled = false;
    removeBtn.disabled = false;
    loadBtn.disabled = true;
    generateDataBtn.disabled = true;
    statechangeBtn.innerText = '隐藏';
    working = true;
  }
};

generateDataBtn.onclick = function () {
  let arr = [], parameter = [];
  ['lon', 'lat', 'lev', 'radiusX', 'radiusY', 'height', 'dx', 'dy', 'dz'].map(id => {
    arr.push(document.getElementById(id).value);
    let [lon, lat, lev, ...val] = arr;
    parameter = [[lon, lat, lev], ...val];
  })
  if (parameter && viewer && !particleObj) {
    let jsonData = new Vortex(...parameter).getData();
    particleObj = new Particle3D(viewer, jsonData, 'json', userInput);
    particleObj.start();
    statechangeBtn.disabled = false;
    removeBtn.disabled = false;
    loadBtn.disabled = true;
    generateDataBtn.disabled = true;
    statechangeBtn.innerText = '隐藏';
    working = true;
  }
};

statechangeBtn.onclick = function () {
  if (particleObj) {
    !working ? particleObj.start() : particleObj.stop();
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

/* let particleObj = new Particle3D(viewer, jsonData, 'json', defaultParticleSystemOptions)
particleObj.start(); */