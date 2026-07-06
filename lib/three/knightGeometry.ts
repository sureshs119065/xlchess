import * as THREE from "three";

/**
 * Builds a stylized chess knight entirely from procedural geometry —
 * no external model file to fetch or license. The turned base/neck is
 * a `LatheGeometry` (a 2D profile revolved around the Y axis, exactly
 * how real turned chess pieces are lathed), and the horse-head silhouette
 * — which isn't rotationally symmetric — is a separate `ExtrudeGeometry`
 * built from a 2D path and mounted on top, facing +Z.
 */
export function buildKnightMesh(color: number, accentColor: number): THREE.Group {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.4,
    roughness: 0.28,
  });

  // --- Turned base + neck -------------------------------------------------
  const profile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.62, 0.0),
    new THREE.Vector2(0.66, 0.05),
    new THREE.Vector2(0.46, 0.14),
    new THREE.Vector2(0.4, 0.24),
    new THREE.Vector2(0.5, 0.3),
    new THREE.Vector2(0.44, 0.36),
    new THREE.Vector2(0.3, 0.46),
    new THREE.Vector2(0.34, 0.6),
    new THREE.Vector2(0.24, 0.72),
    new THREE.Vector2(0.22, 0.86),
    new THREE.Vector2(0.0, 0.86),
  ];
  const latheGeometry = new THREE.LatheGeometry(profile, 48);
  const base = new THREE.Mesh(latheGeometry, material);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // --- Horse-head silhouette, extruded -----------------------------------
  const head = new THREE.Shape();
  head.moveTo(-0.1, 0.0);
  head.bezierCurveTo(-0.28, 0.05, -0.34, 0.22, -0.26, 0.4);
  head.bezierCurveTo(-0.4, 0.5, -0.5, 0.62, -0.46, 0.78);
  head.bezierCurveTo(-0.44, 0.9, -0.3, 0.94, -0.2, 0.86);
  head.bezierCurveTo(-0.1, 1.0, 0.14, 1.04, 0.3, 0.94);
  head.bezierCurveTo(0.44, 0.86, 0.4, 0.7, 0.26, 0.66);
  head.bezierCurveTo(0.36, 0.56, 0.34, 0.4, 0.2, 0.34);
  head.bezierCurveTo(0.3, 0.24, 0.28, 0.1, 0.16, 0.04);
  head.bezierCurveTo(0.08, 0.0, -0.02, -0.02, -0.1, 0.0);

  // Ears — two small notches cut visually via a secondary lobe, simpler
  // to fake as two thin triangular extrusions than a boolean subtraction.
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 16,
  };
  const headGeometry = new THREE.ExtrudeGeometry(head, extrudeSettings);
  headGeometry.center();
  const headMesh = new THREE.Mesh(headGeometry, material);
  headMesh.scale.setScalar(0.92);
  headMesh.rotation.y = Math.PI / 2;
  headMesh.position.set(0, 1.18, 0.02);
  headMesh.castShadow = true;
  group.add(headMesh);

  // Mane accent — a thin contrasting ridge along the back of the neck,
  // purely decorative, gives the silhouette a recognizable "knight" tell
  // even at a glance.
  const maneGeometry = new THREE.ConeGeometry(0.05, 0.4, 8);
  const maneMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    metalness: 0.5,
    roughness: 0.2,
  });
  for (let i = 0; i < 4; i += 1) {
    const tuft = new THREE.Mesh(maneGeometry, maneMaterial);
    tuft.position.set(0, 1.0 - i * 0.11, -0.16 + i * 0.02);
    tuft.rotation.x = Math.PI * 0.42;
    tuft.scale.setScalar(1 - i * 0.12);
    group.add(tuft);
  }

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });

  return group;
}

/**
 * A soft radial-gradient "contact shadow" ellipse under the piece.
 * Generated at runtime with a `CanvasTexture` rather than a fetched
 * image — no network request, no license, and it's cheap to redraw
 * at a different tint if the theme ever changes.
 */
export function buildContactShadow(): THREE.Mesh {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.PlaneGeometry(2.2, 2.2);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.001;
  return mesh;
}
