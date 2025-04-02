// Import Three.js library
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// DOM Elements
const alertToggle = document.getElementById('alert-toggle');
const alertMessage = document.getElementById('alert-message');
const robotStatusBadge = document.getElementById('robot-status-badge');
const leakStatusBadge = document.getElementById('leak-status-badge');
const cameraCard = document.getElementById('camera-card');
const cameraExpand = document.getElementById('camera-expand');
const expandedCamera = document.getElementById('expanded-camera');
const cameraMinimize = document.getElementById('camera-minimize');
const mainGrid = document.getElementById('main-grid');
const robotModelContainer = document.getElementById('robot-model');

// State
let hasAlert = false;

// Initialize Three.js Robot Model
function initRobotModel() {
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0D0F17);
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(75, robotModelContainer.clientWidth / robotModelContainer.clientHeight, 0.1, 1000);
  camera.position.set(3, 3, 3);
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(robotModelContainer.clientWidth, robotModelContainer.clientHeight);
  robotModelContainer.appendChild(renderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  
  // Create robot model
  const robotGroup = new THREE.Group();
  
  // Main body
  const bodyGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0FB6D0, wireframe: true });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  robotGroup.add(body);
  
  // Front camera dome
  const domeGeometry = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeometry, bodyMaterial);
  dome.position.set(0, 0, 0.8);
  robotGroup.add(dome);
  
  // Thrusters
  const thrusterGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  
  const thruster1 = new THREE.Mesh(thrusterGeometry, bodyMaterial);
  thruster1.position.set(1.2, 0, 0);
  thruster1.rotation.set(0, 0, Math.PI / 2);
  robotGroup.add(thruster1);
  
  const thruster2 = new THREE.Mesh(thrusterGeometry, bodyMaterial);
  thruster2.position.set(-1.2, 0, 0);
  thruster2.rotation.set(0, 0, Math.PI / 2);
  robotGroup.add(thruster2);
  
  const thruster3 = new THREE.Mesh(thrusterGeometry, bodyMaterial);
  thruster3.position.set(0, 1.2, 0);
  thruster3.rotation.set(Math.PI / 2, 0, 0);
  robotGroup.add(thruster3);
  
  const thruster4 = new THREE.Mesh(thrusterGeometry, bodyMaterial);
  thruster4.position.set(0, -1.2, 0);
  thruster4.rotation.set(Math.PI / 2, 0, 0);
  robotGroup.add(thruster4);
  
  // Propellers
  const propellerGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16);
  
  const propeller1 = new THREE.Mesh(propellerGeometry, bodyMaterial);
  propeller1.position.set(1.2, 0, 0.2);
  propeller1.rotation.set(0, 0, Math.PI / 2);
  robotGroup.add(propeller1);
  
  const propeller2 = new THREE.Mesh(propellerGeometry, bodyMaterial);
  propeller2.position.set(-1.2, 0, 0.2);
  propeller2.rotation.set(0, 0, Math.PI / 2);
  robotGroup.add(propeller2);
  
  const propeller3 = new THREE.Mesh(propellerGeometry, bodyMaterial);
  propeller3.position.set(0, 1.2, 0.2);
  propeller3.rotation.set(Math.PI / 2, 0, 0);
  robotGroup.add(propeller3);
  
  const propeller4 = new THREE.Mesh(propellerGeometry, bodyMaterial);
  propeller4.position.set(0, -1.2, 0.2);
  propeller4.rotation.set(Math.PI / 2, 0, 0);
  robotGroup.add(propeller4);
  
  scene.add(robotGroup);
  
  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate robot
    robotGroup.rotation.y += 0.005;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (robotModelContainer.clientWidth > 0 && robotModelContainer.clientHeight > 0) {
      camera.aspect = robotModelContainer.clientWidth / robotModelContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(robotModelContainer.clientWidth, robotModelContainer.clientHeight);
    }
  });
}

// Initialize the dashboard
function init() {
  // Initialize the robot model
  initRobotModel();
  
  // Event Listeners
  alertToggle.addEventListener('click', toggleAlert);
  cameraExpand.addEventListener('click', expandCamera);
  cameraMinimize.addEventListener('click', minimizeCamera);
}

// Toggle Alert
function toggleAlert() {
  hasAlert = !hasAlert;
  
  if (hasAlert) {
    alertMessage.classList.remove('hidden');
    alertToggle.textContent = 'Clear Alert';
    robotStatusBadge.className = 'badge alert';
    robotStatusBadge.textContent = 'Alert';
    leakStatusBadge.className = 'badge red';
    leakStatusBadge.textContent = 'Detected';
  } else {
    alertMessage.classList.add('hidden');
    alertToggle.textContent = 'Trigger Alert';
    robotStatusBadge.className = 'badge normal';
    robotStatusBadge.textContent = 'Normal';
    leakStatusBadge.className = 'badge cyan';
    leakStatusBadge.textContent = 'None';
  }
}

// Expand Camera
function expandCamera() {
  mainGrid.classList.add('hidden');
  expandedCamera.classList.remove('hidden');
}

// Minimize Camera
function minimizeCamera() {
  expandedCamera.classList.add('hidden');
  mainGrid.classList.remove('hidden');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);