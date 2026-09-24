import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const LENS_COLORS = ["--lens-one", "--lens-two", "--lens-three"];

function lensShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.56, -1.42);
  shape.bezierCurveTo(-1.18, -1.04, -1.14, 0.78, -0.5, 1.33);
  shape.bezierCurveTo(0.02, 1.7, 0.77, 1.1, 0.84, 0.12);
  shape.bezierCurveTo(0.92, -0.95, 0.19, -1.58, -0.56, -1.42);
  return shape;
}

function createLenses(group, resources) {
  const shape = lensShape();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.075,
    bevelEnabled: true,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    bevelSegments: 4,
    curveSegments: 32,
  });
  const positions = geometry.getAttribute("position");
  for (let vertex = 0; vertex < positions.count; vertex++) {
    const x = positions.getX(vertex);
    const y = positions.getY(vertex);
    const z = positions.getZ(vertex);
    const center = Math.max(0, 1 - (x / 1.1) ** 2 - (y / 1.65) ** 2);
    positions.setZ(vertex, z + (z > 0.037 ? 1 : -1) * center * 0.17);
  }
  geometry.computeVertexNormals();
  resources.push(geometry);
  const materials = [];
  const arrangements = [
    { x: -0.78, z: -0.42, ry: -0.34, rz: -0.16 },
    { x: 0, z: 0.02, ry: 0.02, rz: -0.04 },
    { x: 0.78, z: 0.46, ry: 0.34, rz: 0.17 },
  ];
  arrangements.forEach((position, index) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      metalness: 0,
      roughness: 0.09,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    materials.push({ material, index, surface: true });
    resources.push(material);
    const lens = new THREE.Group();
    lens.position.set(position.x, 0, position.z);
    lens.rotation.set(0, position.ry, position.rz);
    lens.add(new THREE.Mesh(geometry, material));
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.25,
      transparent: true,
      opacity: 0.88,
    });
    materials.push({ material: rimMaterial, index });
    resources.push(rimMaterial);
    const rimPoints = shape.getPoints(120).map((point) =>
      new THREE.Vector3(point.x, point.y, 0.13),
    );
    const rim = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(rimPoints, true),
      120,
      0.024,
      6,
      true,
    );
    resources.push(rim);
    lens.add(new THREE.Mesh(rim, rimMaterial));
    group.add(lens);
  });
  group.rotation.set(-0.13, 0.12, 0);
  return materials;
}

/** @param {HTMLElement} host @param {() => void} unavailable */
export function createSculpture(host, unavailable) {
  const events = new AbortController();
  const on = (target, name, listener) =>
    target.addEventListener(name, listener, { signal: events.signal });
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const transparency = matchMedia("(prefers-reduced-transparency: reduce)");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return undefined;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.set(0, 0, 6.4);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.025);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xfff6e9, 1.8);
  key.position.set(-2.5, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdde3ff, 0.7);
  fill.position.set(4, -2, -3);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const group = new THREE.Group();
  scene.add(group);
  const resources = [];
  const materials = createLenses(group, resources);
  const initial = { x: group.rotation.x, y: group.rotation.y, z: group.rotation.z };
  const base = { ...initial };
  let alive = true;
  let visible = true;
  let dragging = false;
  let pointerId = -1;
  let pointerX = 0;
  let pointerY = 0;
  let phase = 0;
  let frame = 0;
  let lastFrame = 0;
  let lastTick = 0;

  function render() {
    if (!alive) return;
    renderer.render(scene, camera);
    host.classList.add("sculpture-ready");
  }
  function moving() {
    return alive && visible && !document.hidden && !media.matches;
  }
  function pose() {
    group.rotation.set(
      base.x + (moving() && !dragging ? Math.sin(phase * 0.82) * 0.06 : 0),
      base.y + (moving() && !dragging ? Math.sin(phase) * 0.18 : 0),
      base.z,
    );
    group.position.y = moving() && !dragging ? Math.sin(phase * 1.4) * 0.055 : 0;
  }
  function tick(time) {
    frame = 0;
    if (!moving()) return;
    const elapsed = lastTick ? Math.min((time - lastTick) / 1000, 0.06) : 0;
    lastTick = time;
    if (!dragging) phase += elapsed * 0.75;
    if (time - lastFrame >= 1000 / 30) {
      lastFrame = time;
      pose();
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTick = 0;
    if (moving()) frame = requestAnimationFrame(tick);
    else render();
  }
  function applyTheme() {
    const styles = getComputedStyle(document.documentElement);
    const dark = document.documentElement.dataset.theme === "dark";
    materials.forEach(({ material, index, surface }) => {
      material.color.set(styles.getPropertyValue(LENS_COLORS[index]).trim());
      if (surface) material.opacity = transparency.matches ? 1 : dark ? 0.8 : 0.7;
    });
    renderer.toneMappingExposure = dark ? 1.15 : 1;
    render();
  }
  on(host, "pointerdown", (event) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    base.x = group.rotation.x;
    base.y = group.rotation.y;
    phase = 0;
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    dragging = true;
    host.setPointerCapture(pointerId);
    host.classList.add("is-dragging");
    if (event.pointerType !== "touch") host.focus({ preventScroll: true });
  });
  on(host, "pointermove", (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    base.y += (event.clientX - pointerX) * 0.009;
    if (event.pointerType !== "touch") base.x += (event.clientY - pointerY) * 0.006;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pose();
    render();
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    host.classList.remove("is-dragging");
    if (host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId);
    pointerId = -1;
    sync();
  }
  on(host, "pointerup", endDrag);
  on(host, "pointercancel", endDrag);
  on(host, "lostpointercapture", endDrag);
  on(host, "keydown", (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      base.x = initial.x;
      base.y = initial.y;
      base.z = initial.z;
      phase = 0;
      pose();
      render();
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 0.3 : 0.15;
    if (event.key === "ArrowLeft") base.y -= step;
    if (event.key === "ArrowRight") base.y += step;
    if (event.key === "ArrowUp") base.x -= step;
    if (event.key === "ArrowDown") base.x += step;
    pose();
    render();
  });
  const resize = new ResizeObserver(() => {
    const bounds = host.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1 || !alive) return;
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(host);
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: 0.05 });
  observer.observe(host);
  on(document, "visibilitychange", sync);
  on(document, "kemma:palette", applyTheme);
  on(document, "kemma:theme", applyTheme);
  on(media, "change", sync);
  on(transparency, "change", applyTheme);
  on(renderer.domElement, "webglcontextlost", (event) => {
    event.preventDefault();
    alive = false;
    cancelAnimationFrame(frame);
    host.classList.remove("sculpture-ready");
    unavailable();
  });
  applyTheme();
  sync();

  return () => {
    alive = false;
    events.abort();
    cancelAnimationFrame(frame);
    observer.disconnect();
    resize.disconnect();
    resources.forEach((item) => item.dispose());
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    host.classList.remove("sculpture-ready", "is-dragging");
  };
}
