"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Queen3DProps {
  /** Freezes idle spin and parallax — the caller's `useReducedMotion`
   * result is the single source of truth, not read internally. */
  reducedMotion: boolean;
  className?: string;
}

const IDLE_ROTATE_SPEED = 0.0032; // radians/frame at 60fps ≈ one turn every ~33s
const MAX_PARALLAX_RAD = 0.18;
const PARALLAX_EASE = 0.06;

/**
 * A Staunton-style queen profile, revolved 360° with `THREE.LatheGeometry`
 * rather than extruded from a flat glyph — a lathed profile is how real
 * turned chess pieces are actually shaped, so it reads as a genuine 3D
 * piece instead of a flat cutout given depth. A small ring of finial
 * spheres sits atop the crown for the coronet real Staunton queens have.
 */
export function Queen3D({ reducedMotion, className }: Queen3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Brand-colored lighting: a cool indigo key light and a warm gold
    // rim light, matching the accent/signal pairing used everywhere
    // else (stat strip, move ticker, tokens.ts) — the piece itself
    // stays white/ivory, but the light it catches is on-brand.
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = new THREE.DirectionalLight(0x8b7dff, 1.1);
    keyLight.position.set(-6, 10, 10);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xe8b95b, 1.3);
    rimLight.position.set(7, -3, -6);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    // Staunton queen silhouette, base to finial tip, as (radius, height)
    // pairs. Deliberately simplified/stylized — a real turned piece has
    // many more subtle curves — but the base/stem/body/collar/crown
    // proportions read unmistakably as "queen" at this scale.
    const profile: [number, number][] = [
      [0, 0],
      [9.2, 0],
      [9.2, 1.1],
      [7.4, 1.8],
      [4.6, 2.6],
      [3.1, 3.4],
      [2.7, 6.2],
      [3.6, 6.9],
      [5.6, 7.6],
      [6.9, 9.4],
      [7.1, 11.2],
      [6.2, 12.9],
      [4.6, 13.8],
      [3.4, 14.3],
      [3.7, 14.9],
      [5.8, 15.4],
      [6.6, 16.6],
      [5.9, 17.7],
      [3.6, 18.4],
      [1.6, 18.9],
      [0, 19.2],
    ];

    const points = profile.map(([radius, y]) => new THREE.Vector2(radius, y));
    const bodyGeometry = new THREE.LatheGeometry(points, 48);
    bodyGeometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0xf5f6fa, // paper-100 — the "white" in "white queen"
      metalness: 0.12,
      roughness: 0.38,
    });

    const body = new THREE.Mesh(bodyGeometry, material);
    group.add(body);

    // Coronet: a ring of small finials around the crown, the detail
    // that reads as "queen" rather than "generic turned post" at a
    // glance.
    const finialGeometry = new THREE.SphereGeometry(0.85, 12, 12);
    const finialCount = 6;
    const finialRadius = 5.2;
    const finialHeight = 16.2;
    for (let i = 0; i < finialCount; i += 1) {
      const angle = (i / finialCount) * Math.PI * 2;
      const finial = new THREE.Mesh(finialGeometry, material);
      finial.position.set(
        Math.cos(angle) * finialRadius,
        finialHeight,
        Math.sin(angle) * finialRadius
      );
      group.add(finial);
    }

    // Top finial.
    const crownTip = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 14), material);
    crownTip.position.set(0, 19.9, 0);
    group.add(crownTip);

    // Center and normalize scale so the piece fills a consistent
    // portion of its box regardless of container size.
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.sub(center);

    const size = new THREE.Vector3();
    box.getSize(size);
    const largestDimension = Math.max(size.x, size.y, size.z);
    const normalizedScale = 15 / largestDimension;
    group.scale.setScalar(normalizedScale);

    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    function handlePointerMove(event: PointerEvent) {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      targetTiltY = nx * MAX_PARALLAX_RAD;
      targetTiltX = ny * MAX_PARALLAX_RAD * 0.5;
    }

    if (!reducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);

      if (!reducedMotion) {
        group.rotation.y += IDLE_ROTATE_SPEED;
        currentTiltX += (targetTiltX - currentTiltX) * PARALLAX_EASE;
        currentTiltY += (targetTiltY - currentTiltY) * PARALLAX_EASE;
        group.rotation.x = 0.08 + currentTiltX;
        group.rotation.z = currentTiltY * 0.3;
      }

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (nextWidth === 0 || nextHeight === 0) return;
      if (nextWidth === width && nextHeight === height) return; // skip redundant work
      width = nextWidth;
      height = nextHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      bodyGeometry.dispose();
      finialGeometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className={className} />;
}
