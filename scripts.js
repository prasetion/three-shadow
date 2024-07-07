import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

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

// mesh standart material
const material = new THREE.MeshStandardMaterial();
material.metalness = 0.5;
material.roughness = 0.5;

// object
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
sphere.castShadow = true;

const planeBottom = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), material);
planeBottom.rotation.x = Math.PI * -0.5;
planeBottom.position.y = -0.5;
planeBottom.receiveShadow = true;

scene.add(sphere, planeBottom);

// ambient lighting
const ambientLight = new THREE.AmbientLight();
ambientLight.color = new THREE.Color(0xffffff);
ambientLight.intensity = 1;
scene.add(ambientLight);

// directional light
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
scene.add(directionalLight);
directionalLight.position.set(1, 0.25, 0);
directionalLight.castShadow = true;

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
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);

const tick = () => {
  // update controls
  controls.update();

  // render per frame
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
