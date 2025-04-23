// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // white background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

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
    const z = -Math.random() * 100;
    starPositions.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// --- Rocket body ---
let rocketColor = "#808080";
const bodyGeometry = new THREE.CylinderGeometry(1, 1, 5, 64);

function createStripedTexture(color) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#ff0000";
    for (let i = 40; i < size; i += 100) {
        ctx.fillRect(0, i, size, 15);
    }

    return new THREE.CanvasTexture(canvas);
}
document.getElementById("menuToggle").addEventListener("click", () => {
    const menu = document.getElementById("menu");
    menu.classList.toggle("hidden");
});
let bodyMaterial = new THREE.MeshStandardMaterial({
    map: createStripedTexture(rocketColor),
    metalness: 0.8,
    roughness: 0.5
});

const rocketBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
rocketBody.castShadow = true;
scene.add(rocketBody);

// --- Base ---
const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = -2.75;
base.receiveShadow = true;
scene.add(base);

// --- Rocket shadow ---
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

// --- Flame cone ---
const flameGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
const flameMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.7
});
const flame = new THREE.Mesh(flameGeometry, flameMaterial);
flame.position.y = -3.5;
flame.rotation.x = Math.PI;
scene.add(flame);

// --- Glow ring ---
const glowGeometry = new THREE.RingGeometry(1.2, 1.4, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1
});
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
glow.position.y = -2.5;
glow.rotation.x = Math.PI / 2;
scene.add(glow);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// --- Engine glow light ---
const engineLight = new THREE.PointLight(0xff3300, 1, 10);
engineLight.position.set(0, -3.5, 0);
scene.add(engineLight);

// --- Animation ---
let rotating = true;
let flickerTime = 0;
let bobTime = 0;

function animate() {
    requestAnimationFrame(animate);

    if (rotating) rocketBody.rotation.y += 0.01;

    // Flicker flame scale
    flickerTime += 0.05;
    const flameScale = 1 + Math.sin(flickerTime) * 0.1;
    flame.scale.set(flameScale, flameScale, flameScale);

    // Engine light flicker
    engineLight.intensity = 1 + Math.sin(flickerTime * 2) * 0.3;

    // Starfield scroll
    stars.position.z += 0.05;
    if (stars.position.z > 0) stars.position.z = -100;

    // Rocket bobbing
    bobTime += 0.01;
    const bobY = Math.sin(bobTime) * 0.1;
    rocketBody.position.y = bobY;
    flame.position.y = -3.5 + bobY;
    shadow.material.opacity = 0.2 + Math.cos(bobTime) * 0.1;

    renderer.render(scene, camera);
}
animate();

// --- UI Controls ---
document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("menu").classList.toggle("active");
});

document.getElementById("colorSelect").addEventListener("change", (event) => {
    const val = event.target.value;
    if (val === "custom") {
        document.getElementById("customColor").style.display = "block";
    } else {
        document.getElementById("customColor").style.display = "none";
        const newColor = val === "gray" ? "#808080" : "#ffffff";
        updateRocketColor(newColor);
    }
});

document.getElementById("customColor").addEventListener("input", (event) => {
    updateRocketColor(event.target.value);
});

function updateRocketColor(color) {
    bodyMaterial.map = createStripedTexture(color);
    bodyMaterial.needsUpdate = true;
}

document.getElementById("toggleRotation").addEventListener("click", () => {
    rotating = !rotating;
    document.getElementById("toggleRotation").textContent = rotating ? "Stop Rotation" : "Start Rotation";
});

document.getElementById("glowIntensity").addEventListener("input", (event) => {
    glow.material.opacity = parseFloat(event.target.value);
});
