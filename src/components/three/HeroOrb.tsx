import { createElement as h, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, Environment } from "@react-three/drei";
import type { Mesh } from "three";

/**
 * NOTE: This file intentionally avoids JSX for the Three.js scene tree.
 * `lovable-tagger` injects `data-lov-*` attributes into JSX intrinsic
 * elements. When those props reach R3F primitives (mesh, group, points...),
 * R3F's `applyProps` tries to traverse them on the underlying THREE
 * instance and throws: "Cannot read properties of undefined (reading 'lov')".
 * Using `React.createElement` keeps the tagger from instrumenting the tree.
 */

const Orb = () => {
  const meshRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25 + mouse.x * 0.4;
      meshRef.current.rotation.x = mouse.y * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.4;
      innerRef.current.rotation.z = t * 0.15;
    }
  });

  return h(
    "group",
    null,
    h(
      Float,
      { speed: 1.2, rotationIntensity: 0.4, floatIntensity: 1.2 },
      h(
        Sphere,
        { ref: meshRef, args: [1.25, 96, 96] },
        h(MeshDistortMaterial, {
          color: "#5b8cff",
          attach: "material",
          distort: 0.45,
          speed: 1.6,
          roughness: 0.1,
          metalness: 0.85,
          envMapIntensity: 1.2,
        })
      ),
      h(
        Sphere,
        { ref: innerRef, args: [0.78, 64, 64] },
        h(MeshDistortMaterial, {
          color: "#a855f7",
          attach: "material",
          distort: 0.65,
          speed: 2.2,
          roughness: 0,
          metalness: 1,
          emissive: "#7c3aed",
          emissiveIntensity: 0.7,
        })
      ),
      h(
        "mesh",
        { rotation: [Math.PI / 2.6, 0, 0] },
        h("torusGeometry", { args: [1.85, 0.012, 16, 200] }),
        h("meshStandardMaterial", {
          color: "#22d3ee",
          emissive: "#22d3ee",
          emissiveIntensity: 1.4,
          toneMapped: false,
        })
      )
    )
  );
};

const Particles = () => {
  const ref = useRef<any>(null);
  const count = 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return h(
    "points",
    { ref },
    h(
      "bufferGeometry",
      null,
      h("bufferAttribute", {
        attach: "attributes-position",
        count,
        array: positions,
        itemSize: 3,
      })
    ),
    h("pointsMaterial", {
      size: 0.04,
      color: "#a5b4fc",
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      toneMapped: false,
    })
  );
};

export const HeroOrb = () => {
  return h(
    Canvas,
    {
      camera: { position: [0, 0, 5], fov: 45 },
      dpr: [1, 1.75],
      gl: { antialias: true, alpha: true },
      style: { background: "transparent" },
    },
    h(
      Suspense,
      { fallback: null },
      h("ambientLight", { intensity: 0.4 }),
      h("directionalLight", { position: [5, 5, 5], intensity: 1.2, color: "#ffffff" }),
      h("pointLight", { position: [-4, -2, -3], intensity: 2, color: "#a855f7" }),
      h("pointLight", { position: [4, 3, 2], intensity: 1.5, color: "#22d3ee" }),
      h(Environment, { preset: "city" }),
      h(Orb, null),
      h(Particles, null)
    )
  );
};