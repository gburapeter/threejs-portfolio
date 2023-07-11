import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";
THREE.ColorManagement.enabled = false;

/**
 * Debug
 */
// const gui = new dat.GUI();
let scrollY = window.scrollY;
let currentSection = 0;
/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

const parameters = {
	materialColor: "red",
};

// gui.addColor(parameters, "materialColor");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/9.png");

const objectsDistance = 4;
/**
 * Objects
 */
// Material
const material = new THREE.MeshNormalMaterial();
// Meshes
const mesh3 = new THREE.Mesh(new THREE.DodecahedronGeometry(), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh1 = new THREE.Mesh(
	new THREE.TorusKnotGeometry(0.625, 0.2, 100, 16),
	material
);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;
mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;
scene.add(mesh1, mesh2, mesh3);
const sectionMeshes = [mesh1, mesh2, mesh3];
/**
 * Particles
 */
// Geometry
const particlesCount = 100;
const positions = new Float32Array(particlesCount * 3);
const PARTICLE_SIZE = 20;
const newSizes = [];
for (let i = 0; i < particlesCount; i++) {
	positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
	positions[i * 3 + 1] =
		objectsDistance * 0.5 -
		Math.random() * objectsDistance * sectionMeshes.length;
	positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

	newSizes[i] = Math.random() * PARTICLE_SIZE;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute(
	"size",
	new THREE.Float32BufferAttribute(newSizes, 1)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
	sizeAttenuation: true,
});
particlesMaterial.size = 0.3;
particlesMaterial.color = new THREE.Color("white");
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);
/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);
/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("scroll", () => {
	scrollY = window.scrollY;

	const newSection = Math.round(scrollY / sizes.height);

	if (newSection != currentSection) {
		currentSection = newSection;

		gsap.to(sectionMeshes[currentSection].rotation, {
			duration: 1.5,
			ease: "power2.inOut",
			x: "+=6",
			y: "+=3",
		});
	}
});

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	35,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;
	camera.position.y = (-scrollY / sizes.height) * objectsDistance;

	const parallaxX = cursor.x * 0.5;
	const parallaxY = -cursor.y * 0.5;

	cameraGroup.position.x +=
		(parallaxX - cameraGroup.position.x) * 5 * deltaTime;
	cameraGroup.position.y +=
		(parallaxY - cameraGroup.position.y) * 5 * deltaTime;
	// Animate meshes
	for (const mesh of sectionMeshes) {
		mesh.rotation.x += deltaTime * 0.1;
		mesh.rotation.y += deltaTime * 0.12;
		mesh.rotation.z += deltaTime * 0.12;
	}
	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
