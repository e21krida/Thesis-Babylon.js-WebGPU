import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

const models = {};
const dispatchPossibleFlags = {};
let loadedModels = 0;
const canvasContainer = document.querySelector('.canvas-container');

window.onload = function () {
  generateCanvases();
};

function generateCanvases() {
  fetch('modelinformation.json')
    .then(response => response.json())
    .then(modelData => {
      modelData.forEach((model, i) => {
        createCanvases(model, i);
      })
    })
}

function createCanvases(model, index) {
  const canvasId = `canvas${index + 1}`;
  const canvasWrapper = document.createElement('div');
  canvasWrapper.classList.add('canvas-wrapper');
  const canvas = document.createElement('canvas');
  canvas.classList.add('product-canvas');
  canvas.id = canvasId;
  canvas.width = 800;
  canvas.height = 370;
  canvasWrapper.appendChild(canvas);
  const text = document.createElement('div');
  text.classList.add('product-canvas-text');
  text.textContent = model.name;
  canvasWrapper.appendChild(text);
  canvasContainer.appendChild(canvasWrapper);
  canvas.addEventListener('click', function () {
    window.location.href = `product.html?name=${model.name}`;
  });

  initializeBabylon(canvasId, model.path);
}

function initializeBabylon(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 5, -10), scene);
  scene.clearColor = new BABYLON.Color3.FromHexString('#cccccc');
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  dispatchPossibleFlags[canvasId] = true;
  initializeModel(canvasId, modelPath, scene, camera, engine)
}

function initializeModel(canvasId, modelPath, scene, camera, engine) {
  BABYLON.SceneLoader.ImportMesh("", modelPath, "", scene, function (meshes) {
    let model = scene.transformNodes.find(node => node.name == "Sketchfab_model");
    if (model) {
      loadedModels++;
      models[canvasId] = [model];
      scaleModel(model, 1);
      adjustCamera(model, camera);
      model.rotationQuaternion = null;
      model.rotation.x = -Math.PI / 2;
      model.rotation.y = -Math.PI / 2;
      animate(scene, canvasId, engine);
      if (loadedModels == 12) {
        window.dispatchEvent(new CustomEvent('allModelsLoaded'));
      }
    }
  })
}

function scaleModel(model, targetSize) {
  let boundingBox = model.getHierarchyBoundingVectors(true);
  let size = boundingBox.max.subtract(boundingBox.min);
  let maxDimension = Math.max(size.x, size.y, size.z);
  let scaleFactor = targetSize / maxDimension;
  model.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
}

function adjustCamera(model, camera) {
  let boundingBox = model.getHierarchyBoundingVectors(true);
  let center = boundingBox.min.add(boundingBox.max).scale(0.5);
  camera.position = new BABYLON.Vector3(center.x + 1.6, center.y, center.z);
  camera.setTarget(center);
}

function animate(scene, canvasId, engine) {
  engine.runRenderLoop(function () {
    if (models[canvasId] && loadedModels == 12) {
      models[canvasId].forEach(rootMesh => {
        rootMesh.rotation.y += 0.008;
      });
    }
    scene.render();
    if (window.fpsTrackerActive && loadedModels == 12 && dispatchPossibleFlags[canvasId]) {
      const fpsEvent = new CustomEvent('logFPS', { detail: { name: canvasId, value: getFPS() } });
      window.dispatchEvent(fpsEvent);
      dispatchPossibleFlags[canvasId] = false;
      setTimeout(() => {
        dispatchPossibleFlags[canvasId] = true;
      }, 1000);
    }
  });
}