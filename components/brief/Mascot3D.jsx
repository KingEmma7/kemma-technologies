"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Original Kemma character. Three.js is MIT; its license is retained.
// Gaze uses field positions only; answer text never enters the scene.
export default function Mascot3D({ interactive = false, className = "" }) {
  const host = useRef(null), fallback = useRef(null), status = useRef(null);
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const showFallback = () => {
      root.dataset.contextLost = "true";
      if (fallback.current) fallback.current.style.display = "flex";
      if (interactive) root.setAttribute("aria-disabled", "true");
    };
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true });
    } catch { showFallback(); return; }
    delete root.dataset.contextLost;
    root.removeAttribute("aria-disabled");
    if (fallback.current) fallback.current.style.display = "none";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    root.append(canvas);
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1.7, 1.7, 1.7, -1.55, .1, 20);
    camera.position.set(0, .12, 5); camera.lookAt(0, .12, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb59c71, 2.5));
    const key = new THREE.DirectionalLight(0xfff4dc, 3.8); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xdce6ff, 2); rim.position.set(3, 1, -1); scene.add(rim);
    const body = new THREE.Group(); scene.add(body);
    const cream = new THREE.MeshStandardMaterial({ color: 0xf1e6ce, roughness: .34, metalness: .03 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc69c48, roughness: .27, metalness: .38 });
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .32 });
    const ink = new THREE.MeshStandardMaterial({ color: 0x172423, roughness: .26 });
    const pink = new THREE.MeshStandardMaterial({ color: 0xd99883, roughness: .5 });
    const geometries = [], materials = [cream, gold, white, ink, pink];
    const mesh = (geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
      geometries.push(geometry);
      const item = new THREE.Mesh(geometry, material);
      item.position.set(x, y, z); item.scale.set(sx, sy, sz); body.add(item);
      return item;
    };
    mesh(new THREE.SphereGeometry(.85, 32, 24), cream, 0, -.05, 0, 1.03, .96, .85);
    mesh(new THREE.SphereGeometry(.19, 16, 12), cream, -.86, -.27, .06, .64, .94, .65);
    mesh(new THREE.SphereGeometry(.19, 16, 12), cream, .86, -.27, .06, .64, .94, .65);
    mesh(new THREE.SphereGeometry(.14, 16, 12), gold, -.32, -.84, .1, 1.5, .58, 1);
    mesh(new THREE.SphereGeometry(.14, 16, 12), gold, .32, -.84, .1, 1.5, .58, 1);
    const ring = mesh(new THREE.TorusGeometry(.4, .055, 8, 32), gold, 0, .74, 0); ring.rotation.x = Math.PI / 2;
    [-1, 0, 1].forEach(side => {
      const crown = mesh(new THREE.ConeGeometry(.16, side === 0 ? .44 : .34, 4), gold, side * .27, side === 0 ? 1.0 : .93, .04);
      crown.rotation.y = Math.PI / 4;
    });
    const pupils = [], eyes = [], happyEyes = [], brows = [];
    [-1, 1].forEach(side => {
      eyes.push(mesh(new THREE.SphereGeometry(.16, 20, 16), white, side * .26, .10, .647, 1, 1.22, .52));
      const pupil = mesh(new THREE.SphereGeometry(.075, 16, 12), ink, side * .26, .1, .726, .82, 1.17, .4);
      pupils.push({ mesh: pupil, x: side * .26 });
      const glint = new THREE.Mesh(new THREE.SphereGeometry(.027, 8, 8), white);
      geometries.push(glint.geometry); glint.position.set(-.025, .035, .052); pupil.add(glint);
      happyEyes.push(mesh(new THREE.TorusGeometry(.11, .019, 6, 20, Math.PI), ink, side * .26, .07, .749));
      const brow = mesh(new THREE.CapsuleGeometry(.012, .19, 4, 8), ink, side * .26, .32, .671);
      brow.rotation.z = Math.PI / 2; brows.push(brow);
    });
    const smile = mesh(new THREE.TorusGeometry(.13, .015, 6, 20, Math.PI), ink, 0, -.18, .71); smile.rotation.z = Math.PI;
    const openMouth = mesh(new THREE.SphereGeometry(.14, 20, 16), ink, 0, -.23, .719, .7, .95, .17);
    const teeth = mesh(new THREE.BoxGeometry(.21, .035, .016), white, 0, -.175, .752);
    const tongue = mesh(new THREE.SphereGeometry(.065, 16, 12), pink, 0, -.30, .751, 1.24, .55, .18);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let count = 0, disposed = false, frame = 0, inView = true, contextReady = true, lastFrame = 0;
    let lastAttention = 0, nextPeek = 0, nextBlink = 2400, blinkStart = -Infinity, field = null;
    let reaction = null, lastReaction = null, reactionStarted = 0, reactionTimer = 0, reactionCount = 0;
    const target = { x: 0, y: .45 }, current = { x: 0, y: .45 };
    const scope = document.querySelector("[data-brief-flow]") ? "[data-brief-flow]" : "main";
    const selector = scope + " input:not([type=file]):not([type=hidden])," + scope + " textarea," + scope + " select," + scope + " button";
    const fieldAt = node => node instanceof Element ? node.closest(selector) : null;
    const render = () => {
      if (disposed || document.hidden || !inView || !contextReady) return;
      renderer.render(scene, camera); root.dataset.renderCount = String(++count);
    };
    const aim = element => {
      if (!element?.isConnected) return;
      const a = element.getBoundingClientRect(), b = root.getBoundingClientRect();
      target.x = THREE.MathUtils.clamp(((a.left + a.width / 2) - (b.left + b.width / 2)) / Math.max(innerWidth * .5, 1), -1, 1);
      target.y = THREE.MathUtils.clamp(((a.top + a.height / 2) - (b.top + b.height / 2)) / Math.max(innerHeight * .6, 1), -1, 1);
    };
    // Expressions change actual eye, brow and mouth meshes; no face overlays.
    const face = blink => {
      const shocked = reaction === "shocked", laughing = reaction === "laughing", squinting = reaction === "squinting";
      const eyeBlink = reaction ? 1 : blink, gazeWeight = shocked ? .15 : 1;
      eyes.forEach((eye, index) => {
        eye.visible = !laughing;
        eye.scale.set(shocked ? 1.15 : 1, (shocked ? 1.52 : squinting ? (index ? .28 : .40) : 1.22) * eyeBlink, .52);
      });
      pupils.forEach(pupil => {
        pupil.mesh.visible = !laughing;
        pupil.mesh.position.x = pupil.x + current.x * .073 * gazeWeight;
        pupil.mesh.position.y = .10 - current.y * .066 * gazeWeight + (shocked ? .025 : 0);
        pupil.mesh.scale.set(shocked ? .57 : squinting ? .72 : .82, (shocked ? .73 : squinting ? .24 : 1.17) * eyeBlink, .4);
      });
      happyEyes.forEach(eye => { eye.visible = laughing; });
      brows.forEach((brow, index) => {
        brow.visible = shocked || squinting;
        brow.position.y = shocked ? .39 : .25;
        brow.rotation.z = Math.PI / 2 + (squinting ? (index ? -.22 : .22) : (index ? .10 : -.10));
      });
      smile.visible = !shocked && !laughing;
      smile.position.x = squinting ? .035 : 0; smile.rotation.z = Math.PI + (squinting ? -.12 : 0);
      openMouth.visible = shocked || laughing;
      openMouth.scale.set(laughing ? 1.24 : .70, laughing ? 1.03 : .95, .17);
      openMouth.position.y = laughing ? -.24 : -.23;
      teeth.visible = laughing; tongue.visible = laughing;
      root.dataset.reaction = reaction || "idle";
    };
    const settle = () => {
      current.x = 0; current.y = 0; face(1);
      body.position.y = 0; body.rotation.set(0, 0, 0); body.scale.set(1, 1, 1);
      root.dataset.gaze = "0.000,0.000"; render();
    };
    const tick = time => {
      frame = 0;
      if (disposed || media.matches || document.hidden || !inView || !contextReady) return;
      frame = requestAnimationFrame(tick);
      const elapsed = time - lastFrame, interval = 1000 / 30;
      if (elapsed < interval) return;
      lastFrame = time - elapsed % interval;
      if (!reaction && time > nextPeek && time - lastAttention > 2200) {
        const fields = Array.from(document.querySelectorAll(selector)).filter(element => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
        });
        field = fields.length ? fields[Math.floor(Math.random() * fields.length)] : null;
        nextPeek = time + 2600 + Math.random() * 1500;
      }
      if (field?.isConnected) aim(field);
      current.x += (target.x - current.x) * .12; current.y += (target.y - current.y) * .12;
      if (time > nextBlink) { blinkStart = time; nextBlink = time + 3400 + Math.random() * 2600; }
      const blinkAge = time - blinkStart;
      face(blinkAge >= 0 && blinkAge < 180 ? 1 - Math.sin(blinkAge / 180 * Math.PI) * .96 : 1);
      const age = time - reactionStarted, pulse = reaction && age >= 0 && age < 600 ? Math.sin(age / 600 * Math.PI) : 0;
      body.position.y = Math.sin(time / 900) * .023 + (reaction === "shocked" ? pulse * .13 : reaction === "laughing" ? Math.sin(age / 65) * pulse * .055 : 0);
      body.rotation.x = current.y * .075; body.rotation.y = current.x * .12;
      body.rotation.z = Math.sin(time / 1600) * .024 + (reaction === "squinting" ? -.14 * pulse : 0);
      body.scale.set(1 + (reaction === "shocked" ? -.045 : .065) * pulse, 1 + Math.sin(time / 1100) * .009 + (reaction === "shocked" ? .07 : -.065) * pulse, 1);
      root.dataset.gaze = current.x.toFixed(3) + "," + current.y.toFixed(3);
      root.dataset.motion = "animated"; render();
    };
    const start = () => {
      cancelAnimationFrame(frame); frame = 0;
      root.dataset.reducedMotion = String(media.matches);
      if (media.matches) { root.dataset.motion = "still"; settle(); }
      else if (!document.hidden && inView && contextReady) frame = requestAnimationFrame(tick);
    };
    const gaze = event => {
      const element = fieldAt(event?.target) || fieldAt(document.activeElement);
      if (element) { field = element; lastAttention = performance.now(); aim(element); }
      if (media.matches) settle(); else start();
    };
    const resize = () => {
      const rect = root.getBoundingClientRect(); if (rect.width < 1 || rect.height < 1) return;
      renderer.setSize(rect.width, rect.height, false);
      const aspect = rect.width / rect.height; camera.left = -1.65 * aspect; camera.right = 1.65 * aspect;
      camera.updateProjectionMatrix(); gaze();
    };
    const finishReaction = () => {
      reactionTimer = 0; reaction = null; root.dataset.touched = "false";
      const focused = fieldAt(document.activeElement); if (focused) field = focused;
      lastAttention = performance.now(); nextPeek = lastAttention + 1500;
      face(1); start();
    };
    const touch = event => {
      if (!interactive || disposed || !contextReady || (typeof event?.button === "number" && event.button !== 0)) return;
      const choices = ["shocked", "laughing", "squinting"].filter(value => value !== lastReaction);
      reaction = choices[Math.floor(Math.random() * choices.length)]; lastReaction = reaction;
      reactionStarted = performance.now(); clearTimeout(reactionTimer);
      reactionTimer = window.setTimeout(finishReaction, 2000);
      root.dataset.touched = "true"; root.dataset.reactionCount = String(++reactionCount);
      if (status.current) status.current.textContent = { shocked: "Kemma looks surprised.", laughing: "Kemma laughs.", squinting: "Kemma squints playfully." }[reaction];
      face(1); if (media.matches) settle(); else { render(); start(); }
    };
    const keyboard = event => {
      if (interactive && !event.repeat && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); touch(); }
    };
    const contextLost = event => { event.preventDefault(); contextReady = false; cancelAnimationFrame(frame); clearTimeout(reactionTimer); showFallback(); };
    const visible = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start(); };
    const observer = new ResizeObserver(resize); observer.observe(root);
    const intersection = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) { cancelAnimationFrame(frame); frame = 0; } else start();
    });
    intersection.observe(root);
    document.addEventListener("focusin", gaze); document.addEventListener("pointerover", gaze); document.addEventListener("input", gaze);
    document.addEventListener("visibilitychange", visible); window.addEventListener("scroll", gaze, { passive: true }); window.addEventListener("resize", resize);
    media.addEventListener("change", start); canvas.addEventListener("webglcontextlost", contextLost);
    if (interactive) { root.addEventListener("click", touch); root.addEventListener("keydown", keyboard); }
    face(1); resize();
    return () => {
      disposed = true; cancelAnimationFrame(frame); clearTimeout(reactionTimer); observer.disconnect(); intersection.disconnect();
      document.removeEventListener("focusin", gaze); document.removeEventListener("pointerover", gaze); document.removeEventListener("input", gaze);
      document.removeEventListener("visibilitychange", visible); window.removeEventListener("scroll", gaze); window.removeEventListener("resize", resize);
      media.removeEventListener("change", start); canvas.removeEventListener("webglcontextlost", contextLost);
      root.removeEventListener("click", touch); root.removeEventListener("keydown", keyboard);
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); renderer.dispose(); canvas.remove();
    };
  }, [interactive]);
  return <><div ref={host} className={"mascot3d " + className} role={interactive ? "button" : "img"} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? "Kemma mascot. Click or press Enter for a playful reaction." : "Kemma mascot watching the answer fields"}><div ref={fallback} className="mascot-fallback" style={{ display: "none" }} aria-hidden="true"><span>♛</span><span>• •</span></div></div><span ref={status} role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }} /></>;
}
