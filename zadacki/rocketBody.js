// Setup scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("container").appendChild(renderer.domElement);
// --- Starfield ---
const starsGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = [];

for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = -Math.random() * 100; // Behind the rocket
    starPositions.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// --- Rocket shadow (fake soft shadow) ---
const shadowGeometry = new THREE.CircleGeometry(1.5, 32);
const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.3,
    transparent: true
});
const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -3;
scene.add(shadow);

// Function to create striped texture dynamically
function createStripedTexture(color) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Red stripes
    ctx.fillStyle = "#ff0000";
    for (let i = 40; i < size; i += 100) {
        ctx.fillRect(0, i, size, 15);
    }

    return new THREE.CanvasTexture(canvas);
}
// --- Add flame under the rocket ---
const flameGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.7 });
const flame = new THREE.Mesh(flameGeometry, flameMaterial);
flame.position.y = -3.5;
flame.rotation.x = Math.PI;
scene.add(flame);

// Flame flicker animation
let flickerTime = 0;

// Update animate function to flicker flame
function animate() {
    requestAnimationFrame(animate);

    if (rotating) rocketBody.rotation.y += 0.01;

    // Flicker effect (scale pulse)
    flickerTime += 0.05;
    const scale = 1 + Math.sin(flickerTime) * 0.1;
    flame.scale.set(scale, scale, scale);
    // Slowly move stars toward camera
stars.position.z += 0.05;
if (stars.position.z > 0) {
    stars.position.z = -100; // Reset position
}
    renderer.render(scene, camera);
}

// Rocket body
let rocketColor = "#808080"; // Default gray
const bodyGeometry = new THREE.CylinderGeometry(1, 1, 5, 64);
let bodyMaterial = new THREE.MeshStandardMaterial({ 
    map: createStripedTexture(rocketColor), 
    metalness: 0.5, 
    roughness: 0.5
});
const rocketBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
rocketBody.castShadow = true;
scene.add(rocketBody);

// Base stand
const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = -2.75;
base.receiveShadow = true;
scene.add(base);

// Glow effect
const glowGeometry = new THREE.RingGeometry(1.2, 1.4, 32);
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 1 });
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
glow.position.y = -2.5;
glow.rotation.x = Math.PI / 2;
scene.add(glow);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Camera position
camera.position.z = 10;

// Animation loop
let rotating = true;
function animate() {
    requestAnimationFrame(animate);
    if (rotating) rocketBody.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// MENU CONTROLS

// Toggle menu visibility
document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("menu").classList.toggle("active");
});

// Change rocket color
document.getElementById("colorSelect").addEventListener("change", (event) => {
    if (event.target.value === "custom") {
        document.getElementById("customColor").style.display = "block";
    } else {
        document.getElementById("customColor").style.display = "none";
        let newColor = event.target.value === "gray" ? "#808080" : "#ffffff";
        updateRocketColor(newColor);
    }
});

// Custom color picker
document.getElementById("customColor").addEventListener("input", (event) => {
    updateRocketColor(event.target.value);
});

function updateRocketColor(color) {
    bodyMaterial.map = createStripedTexture(color);
    bodyMaterial.needsUpdate = true;
}

// Toggle rotation
document.getElementById("toggleRotation").addEventListener("click", () => {
    rotating = !rotating;
    document.getElementById("toggleRotation").textContent = rotating ? "Stop Rotation" : "Start Rotation";
});

// Adjust glow intensity
document.getElementById("glowIntensity").addEventListener("input", (event) => {
    glow.material.opacity = parseFloat(event.target.value);
});
