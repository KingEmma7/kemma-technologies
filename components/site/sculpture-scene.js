import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Original parametric sculpture: a flat metal ribbon with one continuous twist.
// No artwork, scene, model, or motion preset is imported.
/** @param {HTMLElement} host @param {() => void} unavailable */
export function createSculpture(host, unavailable) {
  const events = new AbortController();
  const on = (target, type, listener) =>
    target.addEventListener(type, listener, { signal: events.signal });
  const media = matchMedia("(prefers-reduced-motion: reduce)");
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
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0.2, 6.7);
  camera.lookAt(0, 0, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.025);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  const group = new THREE.Group();
  scene.add(group);
  const uCount = 300,
    vCount = 24;
  function ribbon(radius, width, thickness) {
    const positions = [],
      indices = [],
      uv = [];
    for (let i = 0; i <= uCount; i++) {
      const u = (i / uCount) * Math.PI * 2;
      for (let j = 0; j <= vCount; j++) {
        const v = (j / vCount) * Math.PI * 2;
        const a = width * Math.cos(v),
          b = thickness * Math.sin(v);
        const twist = u;
        const radial = a * Math.cos(twist) - b * Math.sin(twist);
        const height = a * Math.sin(twist) + b * Math.cos(twist);
        positions.push(
          (radius + radial) * Math.cos(u),
          height,
          (radius + radial) * Math.sin(u),
        );
        uv.push(i / uCount, j / vCount);
        if (i < uCount && j < vCount) {
          const p = i * (vCount + 1) + j,
            q = p + vCount + 1;
          indices.push(p, q, p + 1, q, q + 1, p + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
  const geometry = ribbon(1.18, 0.65, 0.065);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xc4c9be,
    metalness: 1,
    roughness: 0.27,
    clearcoat: 0.25,
    clearcoatRoughness: 0.24,
    side: THREE.DoubleSide,
  });
  // A hit on the actual metal controls a local material tint, not a screen overlay.
  // https://threejs.org/docs/pages/Material.html#onBeforeCompile
  const hoverPoint = { value: new THREE.Vector3() },
    hoverAmount = { value: 0 };
  const hoverGold = { value: new THREE.Color("#cba45e") };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHoverPoint = hoverPoint;
    shader.uniforms.uHoverAmount = hoverAmount;
    shader.uniforms.uHoverGold = hoverGold;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vMetalPosition;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvMetalPosition = position;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vMetalPosition;\nuniform vec3 uHoverPoint;\nuniform vec3 uHoverGold;\nuniform float uHoverAmount;",
      )
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nfloat warmth = (1.0 - smoothstep(0.08, 0.85, distance(vMetalPosition, uHoverPoint))) * uHoverAmount;\ndiffuseColor.rgb = mix(diffuseColor.rgb, uHoverGold, warmth * 0.86);",
      );
  };
  material.customProgramCacheKey = () => "kemma-local-gold-v1";
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  let pointerInside = false,
    hoverTarget = 0;
  function updateHover() {
    if (pointerInside) {
      mesh.updateWorldMatrix(true, false);
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(mesh, false)[0];
      hoverTarget = hit ? 1 : 0;
      if (hit) hoverPoint.value.copy(mesh.worldToLocal(hit.point));
    } else hoverTarget = 0;
    hoverAmount.value = media.matches
      ? hoverTarget
      : THREE.MathUtils.lerp(hoverAmount.value, hoverTarget, 0.22);
    if (Math.abs(hoverAmount.value - hoverTarget) < 0.002)
      hoverAmount.value = hoverTarget;
  }
  function hoverActive() {
    return pointerInside || hoverAmount.value > 0;
  }

  // A fine seam follows the edge, giving the otherwise simple form a crafted detail.
  const seamMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a916f,
    metalness: 1,
    roughness: 0.32,
  });
  const points = [];
  for (let i = 0; i <= 360; i++) {
    const u = (i / 360) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        (1.18 + 0.65 * Math.cos(u)) * Math.cos(u),
        0.65 * Math.sin(u),
        (1.18 + 0.65 * Math.cos(u)) * Math.sin(u),
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points, true);
  const seamGeometry = new THREE.TubeGeometry(curve, 360, 0.006, 5, true);
  group.add(new THREE.Mesh(seamGeometry, seamMaterial));
  const key = new THREE.DirectionalLight(0xfffaf0, 3.0);
  key.position.set(-2, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe2e8d1, 1.2);
  fill.position.set(4, -1, -3);
  scene.add(fill);
  const base = { x: 0.78, y: 0.15, z: -0.38 };
  group.rotation.set(base.x, base.y, base.z);
  let visible = true,
    paused = false,
    frame = 0,
    last = 0,
    phase = 0,
    alive = true;
  let drag = null,
    velocityX = 0,
    velocityY = 0;
  const active = () => alive && visible && !document.hidden;
  const ambient = () => !paused && !media.matches && !drag;
  const hasInertia = () =>
    !paused &&
    !media.matches &&
    Math.abs(velocityX) + Math.abs(velocityY) > 0.0002;
  function draw() {
    updateHover();
    renderer.render(scene, camera);
    host.classList.add("sculpture-ready");
  }
  function applyTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    material.color.set(dark ? 0xaebea3 : 0xc4c9be);
    material.envMapIntensity = dark ? 0.8 : 1;
    seamMaterial.color.set(dark ? 0xc0ab78 : 0x8a916f);
    key.intensity = dark ? 2.2 : 3;
    fill.intensity = dark ? 1.5 : 1.2;
    renderer.toneMappingExposure = dark ? 1.0 : 1.25;
    if (alive) draw();
  }
  function freeze() {
    base.x = group.rotation.x;
    base.y = group.rotation.y;
    base.z = group.rotation.z;
    phase = 0;
    group.position.y = 0;
  }
  function tick(time) {
    frame = 0;
    if (!active()) return;
    if (time - last >= 1000 / 30) {
      const dt = last ? Math.min((time - last) / 1000, 0.07) : 0;
      last = time;
      if (!drag) {
        if (hasInertia()) {
          const scale = dt * 60;
          base.x += velocityY * scale;
          base.y += velocityX * scale;
          velocityX *= Math.pow(0.89, scale);
          velocityY *= Math.pow(0.89, scale);
        }
        if (ambient()) phase += dt;
        group.rotation.set(
          base.x + (ambient() ? Math.sin(phase * 0.24) * 0.06 : 0),
          base.y + (ambient() ? Math.sin(phase * 0.19) * 0.26 : 0),
          base.z + (ambient() ? Math.sin(phase * 0.14) * 0.025 : 0),
        );
        group.position.y = ambient() ? Math.sin(phase * 0.38) * 0.045 : 0;
        draw();
      }
    }
    if (ambient() || hasInertia() || hoverActive())
      frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (!alive) return;
    if (active() && (ambient() || hasInertia() || hoverActive()))
      frame = requestAnimationFrame(tick);
    else if (active()) draw();
  }
  function stopDrag() {
    if (!drag) return;
    const pointerId = drag.id;
    if (performance.now() - drag.lastTime > 100) {
      velocityX = 0;
      velocityY = 0;
    }
    drag = null;
    host.classList.remove("is-dragging");
    if (host.hasPointerCapture(pointerId))
      host.releasePointerCapture(pointerId);
    sync();
  }
  on(host, "pointerdown", (event) => {
    if (
      !alive ||
      drag ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    )
      return;
    freeze();
    velocityX = 0;
    velocityY = 0;
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      lastTime: performance.now(),
      touch: event.pointerType === "touch",
      horizontal: false,
    };
    host.classList.add("pointer-interaction");
    host.setPointerCapture(event.pointerId);
    if (event.pointerType !== "touch") host.focus({ preventScroll: true });
    host.classList.add("is-dragging");
    sync();
  });
  on(host, "pointermove", (event) => {
    if (event.pointerType !== "touch") {
      const rect = host.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      pointerInside = true;
      if (!frame) sync();
    }
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (drag.touch && !drag.horizontal) {
      const totalX = Math.abs(event.clientX - drag.startX),
        totalY = Math.abs(event.clientY - drag.startY);
      if (totalY > totalX && totalY > 6) {
        stopDrag();
        return;
      }
      if (totalX < 6) return;
      drag.horizontal = true;
    }
    const sensitivity = (2 * Math.PI) / Math.max(host.clientWidth, 300);
    const now = performance.now(),
      factor = 16.67 / Math.max(now - drag.lastTime, 8);
    base.y += dx * sensitivity;
    if (!drag.touch) base.x += dy * sensitivity;
    velocityX = Math.max(-0.08, Math.min(0.08, dx * sensitivity * factor));
    velocityY = drag.touch
      ? 0
      : Math.max(-0.08, Math.min(0.08, dy * sensitivity * factor));
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.lastTime = now;
    group.rotation.set(base.x, base.y, base.z);
    draw();
  });
  on(host, "pointerleave", () => {
    pointerInside = false;
    sync();
  });
  on(host, "pointerup", stopDrag);
  on(host, "pointercancel", () => {
    velocityX = 0;
    velocityY = 0;
    stopDrag();
  });
  on(host, "lostpointercapture", stopDrag);
  function reset() {
    stopDrag();
    velocityX = 0;
    velocityY = 0;
    phase = 0;
    base.x = 0.78;
    base.y = 0.15;
    base.z = -0.38;
    group.rotation.set(base.x, base.y, base.z);
    group.position.y = 0;
    draw();
    sync();
  }
  on(host, "blur", () => host.classList.remove("pointer-interaction"));
  on(host, "keydown", (event) => {
    host.classList.remove("pointer-interaction");
    if (event.code === "Space") {
      event.preventDefault();
      freeze();
      paused = !paused;
      velocityX = 0;
      velocityY = 0;
      sync();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      reset();
      return;
    }
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    freeze();
    velocityX = 0;
    velocityY = 0;
    const step = event.shiftKey ? 0.3 : 0.12;
    if (event.key === "ArrowLeft") base.y -= step;
    if (event.key === "ArrowRight") base.y += step;
    if (event.key === "ArrowUp") base.x -= step;
    if (event.key === "ArrowDown") base.x += step;
    group.rotation.set(base.x, base.y, base.z);
    draw();
    sync();
  });
  const resize = new ResizeObserver(() => {
    const rect = host.getBoundingClientRect();
    if (!alive || rect.width < 1 || rect.height < 1) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    draw();
  });
  resize.observe(host);
  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        velocityX = 0;
        velocityY = 0;
        stopDrag();
      }
      sync();
    },
    { threshold: 0.05 },
  );
  visibility.observe(host);
  on(media, "change", () => {
    freeze();
    velocityX = 0;
    velocityY = 0;
    sync();
  });
  on(document, "visibilitychange", () => {
    if (document.hidden) {
      velocityX = 0;
      velocityY = 0;
      stopDrag();
    }
    sync();
  });
  on(document, "kemma:theme", applyTheme);
  on(renderer.domElement, "webglcontextlost", (event) => {
    event.preventDefault();
    alive = false;
    if (frame) cancelAnimationFrame(frame);
    host.classList.remove("sculpture-ready");
    unavailable();
  });
  applyTheme();
  sync();
  return () => {
    alive = false;
    events.abort();
    cancelAnimationFrame(frame);
    resize.disconnect();
    visibility.disconnect();
    geometry.dispose();
    material.dispose();
    seamMaterial.dispose();
    seamGeometry.dispose();
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    host.classList.remove(
      "sculpture-ready",
      "is-dragging",
      "pointer-interaction",
    );
  };
}
