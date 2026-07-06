"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildContactShadow, buildKnightMesh } from "@/lib/three/knightGeometry";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInView } from "@/hooks/useInView";

const ACCENT = 0x8b7dff;
const SIGNAL = 0xe8b95b;
const KNIGHT_COLOR = 0x1b2038;

export function KnightScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !inView) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20);
    camera.position.set(0, 1.35, 4.2);
    camera.lookAt(0, 0.75, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Three-point lighting: cool key light, dim fill, and a warm rim
    // light from behind to separate the piece from the background —
    // the same setup a product photographer would use.
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(2.2, 3, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(ACCENT, 0.5);
    fillLight.position.set(-2.5, 1, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(SIGNAL, 3.5, 8);
    rimLight.position.set(-0.6, 1.8, -2.2);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x404868, 0.9);
    scene.add(ambient);

    const knight = buildKnightMesh(KNIGHT_COLOR, ACCENT);
    knight.scale.setScalar(0.85);
    scene.add(knight);

    const shadow = buildContactShadow();
    scene.add(shadow);

    // --- Entrance: rise + spin + fade in, via manual easing rather ---
    // --- than a tween library, since this is the only animated value --
    const entranceDuration = reducedMotion ? 0 : 900;
    const entranceStart = performance.now();
    knight.position.y = reducedMotion ? 0 : -0.6;
    knight.rotation.y = reducedMotion ? 0 : -Math.PI * 0.35;

    // --- Drag-to-rotate state ---
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let velocityY = 0;
    let manualTiltX = 0;

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      container.style.cursor = "grabbing";
      container.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;

      velocityY = deltaX * 0.01;
      knight.rotation.y += velocityY;

      manualTiltX = THREE.MathUtils.clamp(manualTiltX + deltaY * 0.005, -0.25, 0.35);
    };

    const handlePointerUp = (event: PointerEvent) => {
      isDragging = false;
      container.style.cursor = "grab";
      container.releasePointerCapture(event.pointerId);
    };

    container.style.cursor = "grab";
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerUp);

    // --- Resize handling ---
    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // --- Pause the render loop when the tab isn't visible ---
    let isPageVisible = true;
    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isPageVisible) return;

      const elapsed = clock.getElapsedTime();
      const now = performance.now();

      // Entrance easing (ease-out cubic), runs once.
      if (now - entranceStart < entranceDuration) {
        const progress = (now - entranceStart) / entranceDuration;
        const eased = 1 - Math.pow(1 - progress, 3);
        knight.position.y = THREE.MathUtils.lerp(-0.6, 0, eased);
        knight.rotation.y = THREE.MathUtils.lerp(-Math.PI * 0.35, 0, eased);
      } else if (!isDragging && !reducedMotion) {
        // Idle state: slow continuous rotation + gentle vertical bob.
        knight.rotation.y += 0.0035;
        knight.position.y = Math.sin(elapsed * 0.9) * 0.045;
      } else if (!isDragging) {
        // Drag momentum decay even under reduced motion (user-initiated).
        knight.rotation.y += velocityY;
        velocityY *= 0.9;
      }

      knight.rotation.x = THREE.MathUtils.lerp(knight.rotation.x, manualTiltX, 0.12);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerUp);

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [inView, reducedMotion]);

  return (
    <div
      ref={viewRef}
      className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-ink-600 bg-ink-800 shadow-card"
    >
      <div ref={containerRef} className="h-full w-full touch-none" aria-hidden="true" />
    </div>
  );
}
