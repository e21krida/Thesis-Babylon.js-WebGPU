import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

let dispatchPossibleFlag = true;
const canvasContainer = document.querySelector('.product-canvas-container');

function getURLParam(parameter) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(parameter);
}

document.addEventListener('DOMContentLoaded', function () {
  const modelName = getURLParam('name');
  if (modelName) {
    generateCanvas(modelName);
  }
})

function generateCanvas(modelName) {
  fetch('modelinformation.json')
    .then(response => response.json())
    .then(modelData => {
      const rightModel = modelData.find(row => row.name === modelName);
      console.log(rightModel);
      const canvasWrapper = document.createElement('div');
      canvasWrapper.classList.add('product-canvas-wrapper');
      const canvas = document.createElement('canvas');
      canvas.classList.add('product-canvas');
      canvas.id = `canvas1`;
      canvas.width = 800;
      canvas.height = 370;
      canvasWrapper.appendChild(canvas);

      const text = document.createElement('div');
      text.classList.add('product-canvas-text');
      text.textContent = modelName;

      const description = document.createElement("p");
      description.classList.add("description");
      description.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur a nibh condimentum, suscipit nunc quis, pharetra neque. Aliquam convallis sed magna at auctor. Vivamus tincidunt luctus dui, at imperdiet purus tincidunt vitae. Phasellus euismod lacus vel quam bibendum, in ultrices velit eleifend. Curabitur eget suscipit eros, et finibus augue. Fusce orci urna, feugiat dictum mollis non, pellentesque id lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur rutrum mi at tempor consectetur. Sed sit amet urna vel metus egestas bibendum sed a leo. Pellentesque luctus nisl eu tincidunt vulputate. Fusce facilisis non ligula eu vehicula. Sed fringilla odio id malesuada porttitor. Vestibulum finibus aliquet lectus, et dapibus lacus elementum nec. Nulla lobortis, lectus ut hendrerit pretium.";
      text.appendChild(description);
      canvasWrapper.appendChild(text);
      canvasContainer.appendChild(canvasWrapper);

      let referenceText = document.createElement('span');
      referenceText.classList.add('product-reference-text');
      canvasWrapper.appendChild(referenceText);
      let sourceA = document.createElement('a');
      sourceA.textContent = rightModel.references[0].text;
      sourceA.href = rightModel.references[0].href;
      referenceText.appendChild(sourceA);
      let text1 = document.createTextNode(' by ');
      referenceText.appendChild(text1);
      let sourceB = document.createElement('a');
      sourceB.textContent = rightModel.references[1].text;
      sourceB.href = rightModel.references[1].href;
      referenceText.appendChild(sourceB);
      let text2 = document.createTextNode(' is licensed under ');
      referenceText.appendChild(text2);
      let sourceC = document.createElement('a');
      sourceC.textContent = 'CC BY 4.0'
      sourceC.href = 'https://creativecommons.org/licenses/by/4.0/';
      referenceText.appendChild(sourceC);

      initializeBabylon(rightModel.path);
    });
}

function initializeBabylon(modelPath) {
  const canvas = document.getElementById("canvas1");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3.FromHexString('#cccccc');
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  initializeModel(modelPath, scene, engine)
}

function initializeModel(modelPath, scene, engine) {
  BABYLON.SceneLoader.ImportMesh("", modelPath, "", scene, function (meshes) {
    let model = scene.transformNodes.find(node => node.name == "Sketchfab_model");
    if (model) {
      scaleModel(model, 1);
      const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 5, -10), scene);
      adjustCamera(model, camera);
      model.rotationQuaternion = null;
      model.rotation.x = -Math.PI / 2;
      model.rotation.y = -Math.PI / 2;
      animate(scene, model, engine);
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

function animate(scene, model, engine) {
  engine.runRenderLoop(function () {
    model.rotation.y += 0.01;
    scene.render();
    if (window.fpsTrackerActive && model && dispatchPossibleFlag) {
      const fpsEvent = new CustomEvent('logFPS', { detail: { value: getFPS() } });
      window.dispatchEvent(fpsEvent);
      dispatchPossibleFlag = false;
      setTimeout(() => {
        dispatchPossibleFlag = true;
      }, 1000);
    }
  });
}