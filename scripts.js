import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import bakedShadow from "/textures/bakedShadow.jpg";
import simpleShadow from "/textures/simpleShadow.jpg";

// canvas
const canvas = document.querySelector("canvas.webgl");

// gui
const gui = new GUI();

// cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
  console.log(cursor.x, cursor.y);
});

// scene
const scene = new THREE.Scene();

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const textureLoader = new THREE.TextureLoader();
const bakedShadowTexture = textureLoader.load(bakedShadow);
bakedShadowTexture.colorSpace = THREE.SRGBColorSpace;

const simpleShadowTexture = textureLoader.load(simpleShadow);

// mesh standart material
const material = new THREE.MeshStandardMaterial();
material.metalness = 0.5;
material.roughness = 0.5;

// object
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
sphere.castShadow = true;

const planeBottom = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  // new THREE.MeshBasicMaterial({ map: bakedShadowTexture })
  material
);
planeBottom.rotation.x = Math.PI * -0.5;
planeBottom.position.y = -0.5;
planeBottom.receiveShadow = true;

const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    alphaMap: simpleShadowTexture,
  })
);
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = planeBottom.position.y + 0.01;

scene.add(sphere, planeBottom, sphereShadow);

// ambient lighting
const ambientLight = new THREE.AmbientLight();
ambientLight.color = new THREE.Color(0xffffff);
ambientLight.intensity = 2;
scene.add(ambientLight);

// directional light
const shadowMapSize = 1024;
const directionalLight = new THREE.DirectionalLight(0x00fffc, 1);
scene.add(directionalLight);
directionalLight.position.set(1, 0.25, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = shadowMapSize;
directionalLight.shadow.mapSize.height = shadowMapSize;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.radius = 10;

// directionalCameraHelper
const directionalLightHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightHelper.visible = false;
scene.add(directionalLightHelper);

// spot light
const spotLight = new THREE.SpotLight(0xffffff, 2, 10, Math.PI * 0.3);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = shadowMapSize;
spotLight.shadow.mapSize.height = shadowMapSize;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;
spotLight.position.set(0, 2, 2);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
spotLightCameraHelper.visible = false;
scene.add(spotLightCameraHelper);

// point light
const pointLight = new THREE.PointLight(0xffffff, 2.7);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
pointLight.shadow.mapSize.width = shadowMapSize;
pointLight.shadow.mapSize.height = shadowMapSize;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;
scene.add(pointLight);

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointLightCameraHelper.visible = false;
scene.add(pointLightCameraHelper);

// debug gui
gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "x").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "y").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "z").min(0).max(1).step(0.001);

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight,
//   0.2
// );
// scene.add(directionalLightHelper);

// event listener resize
window.addEventListener("resize", () => {
  console.log("window has been resized");

  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
});

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  1000
);

camera.position.z = 3;
scene.add(camera);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();

const tick = () => {
  // update controls
  controls.update();

  const elapsedTime = clock.getElapsedTime();

  // Update the sphere
  sphere.position.x = Math.cos(elapsedTime) * 1.5;
  sphere.position.z = Math.sin(elapsedTime) * 1.5;
  sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

  // Update the shadow
  sphereShadow.position.x = sphere.position.x;
  sphereShadow.position.z = sphere.position.z;
  sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3;

  // render per frame
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
