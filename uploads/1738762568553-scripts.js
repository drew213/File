
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";


// 1️⃣ Initialize Three.js Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
const container = document.getElementById("threejs-container");
if (container) {
  container.appendChild(renderer.domElement);
} else {
  console.log.error("Threejs container not found!!");
}

// 2️⃣ Load Environment Map for Reflections
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// 3️⃣ Load Font and Create 3D Text
const loader = new FontLoader();
loader.load("./assets/BaksodaDemo_Regular.json", (font) => {
  const textGeometry = new TextGeometry("Secrets", {
    font: font,
    size: 0.4,
    height: 0.3,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.02,
    bevelSegments: 14,
  });

  const textMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x090909),
    metalness: 0.8,
    roughness: 0.3,
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.castShadow = true;

  // Center the text in the scene
  textGeometry.computeBoundingBox();
  const { boundingBox } = textGeometry;
  const textWidth = boundingBox.max.x - boundingBox.min.x;
  textMesh.position.set(-textWidth / 2, 0, 0);

  // Create a group for rotating the text
  const textGroup = new THREE.Group();
  textGroup.add(textMesh);
  scene.add(textGroup);

  // Animation Loop
  // sourcery skip: avoid-function-declarations-in-blocks
  function animate() {
    requestAnimationFrame(animate);
    textGroup.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
});

// 4️⃣ Add Lighting
scene.add(new THREE.AmbientLight(0x404040));

// 5️⃣ Handle Window Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// 6️⃣ Handle Email Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const emailForm = document.getElementById("email-form");
  const emailInput = document.getElementById("email");

  if (emailForm) {
    emailForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      if (!email) {
        alert("Please enter a valid email.");
        return;
      }

      try {
        const response = await fetch(
          "https://backend-secrets.onrender.com/submit-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        if (response.ok) {
          alert("Email submitted successfully!");
          emailInput.value = ""; // Clear the input field
        } else {
          const result = await response.json();
          alert(`Failed to submit email: ${result.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    });
  }
});
