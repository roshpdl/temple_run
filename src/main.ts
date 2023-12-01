/* eslint-disable one-var */
/* eslint-disable default-case */
/*
 * main.js
 * Author: Roshan Poudel, Sherry Khan
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { insideWorld } from './core/sceneSetup';
import { Character } from './core/character';
import Obstacle from './core/obstacle';

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let cameraControls: OrbitControls;
let gameCharacter: Character;
let obstacles: Obstacle[] = [];

const clock = new THREE.Clock();

function fillScene() {
  scene = new THREE.Scene();

  // LIGHTS
  scene.add(new THREE.AmbientLight(0x333333));

  let light = new THREE.DirectionalLight(0xFFFFFF, 0.9);
  light.position.set(-1300, 700, 1240);
  light.castShadow = true;

  scene.add(light);

  light = new THREE.DirectionalLight(0xFFFFFF, 0.7);
  light.position.set(1000, -500, -1200);
  light.castShadow = true;

  scene.add(light);

  // MATERIALS
  const path = '/assets/textures/skybox/';
  const urls = [`${path}px.jpg`, `${path}nx.jpg`,
    `${path}py.jpg`, `${path}ny.jpg`,
    `${path}pz.jpg`, `${path}nz.jpg`];

  const textureCube = (new THREE.CubeTextureLoader()).load(urls);
  textureCube.format = THREE.RGBAFormat;

  const shader = THREE.ShaderLib.cube;
  shader.uniforms.tCube.value = textureCube;

  const skyMaterial = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  });

  const sky = new THREE.Mesh(new THREE.BoxGeometry(5000, 5000, 5000), skyMaterial);
  scene.add(sky);

  // groundplane
  insideWorld(scene);

  // CHARACTER
  // Create and add Steve character to the scene
  gameCharacter = new Character();
  const characterMesh = gameCharacter.getMesh();
  characterMesh.position.set(0, -1100, 1800);
  // characterMesh.position.y = -1300;
  characterMesh.castShadow = true;
  scene.add(characterMesh);

  // Create and add obstacles to the scene
  createObstacles();
}

// OBSATCLES
function createObstacles() {
  // Create 5 obstacles for now
  for (let i = 0; i < 5; i++) {
    const obstacle = new Obstacle();
    obstacles.push(obstacle);
    scene.add(obstacle.mesh); // Add obstacle mesh to the scene
  }
}

function init() {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // CAMERA
  camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 100, 20000);
  camera.position.set(0, 2000, 4000);

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0xffffff, 1.0);
  renderer.shadowMap.enabled = true;

  // CONTROLS
  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, -160, 0);

  // Screen Resize
  window.addEventListener('resize', onWindowResize, false);
}

// EVENT HANDLERS
function addToDOM() {
  const container = document.getElementById('container')!;
  const canvas = container.getElementsByTagName('canvas');
  if (canvas.length > 0) {
    container.removeChild(canvas[0]);
  }
  container.appendChild(renderer.domElement);
}

function render() {
  const delta = clock.getDelta();
  cameraControls.update(delta);

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  update(clock.getDelta());
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const KEY_UP = 38;
const KEY_W = 87;
const KEY_LEFT = 37;
const KEY_A = 65;
const KEY_DOWN = 40;
const KEY_S = 83;
const KEY_RIGHT = 39;
const KEY_D = 68;
const KEY_SPACE = 32;
// const FPS = 60;

const keyState = Object.create(null) as Record<number, boolean>;

window.addEventListener('keydown', (event: KeyboardEvent) => {
  keyState[event.keyCode] = true; 
  // Check if the spacebar is pressed
  if (event.keyCode === KEY_SPACE) {
    gameCharacter.jump(); // Call the jump method on character object
  }
});

window.addEventListener('keyup', (event: KeyboardEvent) => { 
  keyState[event.keyCode] = false;
});

function update(delta: number) {
  let x = 0, z = 0;

  if (keyState[KEY_UP] || keyState[KEY_W]) z += 1;
  if (keyState[KEY_LEFT] || keyState[KEY_A]) x += 1;
  if (keyState[KEY_DOWN] || keyState[KEY_S]) z += -1;
  if (keyState[KEY_RIGHT] || keyState[KEY_D]) x += -1;

  gameCharacter.move(x, z);
  gameCharacter.update(delta); // Update the character for jumping and other animations

  // Update the obstacles
  // Update each obstacle
  obstacles.forEach(obstacle => {
    obstacle.update();
  });

  render();
}

// setInterval(update, 1000 / FPS); // update FPS times per second

init();
fillScene();
addToDOM();
animate();
