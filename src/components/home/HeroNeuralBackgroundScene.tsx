"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
uniform float uTime;
uniform vec2 uPointer;

varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;

  vec3 transformed = position;
  vec2 centeredUv = uv - 0.5;

  float pointerDistance = distance(uv, uPointer);
  float pointerWave = smoothstep(0.55, 0.0, pointerDistance);

  transformed.z += sin(centeredUv.x * 9.0 + uTime * 0.55) * 0.055;
  transformed.z += cos(centeredUv.y * 8.0 - uTime * 0.45) * 0.05;
  transformed.z += pointerWave * 0.14;

  vDepth = transformed.z;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uPointer;

varying vec2 vUv;
varying float vDepth;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x)
    + (c - a) * u.y * (1.0 - u.x)
    + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.05;
    amplitude *= 0.5;
  }

  return value;
}

float neuralLine(vec2 uv, float scale, float width, float speed) {
  vec2 p = uv * scale;

  float flow =
    sin(p.x + fbm(p * 0.35 + uTime * speed) * 4.0) *
    cos(p.y - fbm(p.yx * 0.32 - uTime * speed) * 4.0);

  float core = 1.0 - smoothstep(0.0, width, abs(flow));
  float glow = 1.0 - smoothstep(width, width * 6.0, abs(flow));

  return core * 1.35 + glow * 0.28;
}

void main() {
  vec2 uv = vUv;
  vec2 center = uv - 0.5;
  float radius = length(center);
  float angle = atan(center.y, center.x);

  float pointer = smoothstep(0.42, 0.0, distance(uv, uPointer));

  vec2 driftA = vec2(
    sin(uTime * 0.08) * 0.045,
    cos(uTime * 0.07) * 0.035
  );

  vec2 driftB = vec2(
    cos(uTime * 0.06) * 0.035,
    sin(uTime * 0.09) * 0.045
  );

  float vortex = sin(angle * 3.5 + radius * 18.0 - uTime * 0.62) * 0.5 + 0.5;

  float largeLines = neuralLine(uv + driftA, 7.0, 0.045, 0.16);
  float sharpLines = neuralLine(uv + driftB, 14.0, 0.018, 0.12);
  float microLines = neuralLine(uv + vec2(0.0, uTime * 0.012), 24.0, 0.01, 0.08);

  float nebula = fbm(uv * 3.0 + vec2(uTime * 0.015, -uTime * 0.012));
  float energy = largeLines * 0.55 + sharpLines * 0.75 + microLines * 0.24;
  energy += vortex * 0.2 + pointer * 0.55 + vDepth * 0.45;

  vec3 bgTop = vec3(0.030, 0.040, 0.070);
  vec3 bgMid = vec3(0.055, 0.050, 0.120);
  vec3 bgDeep = vec3(0.012, 0.014, 0.026);

  vec3 violet = vec3(0.430, 0.330, 0.950);
  vec3 electric = vec3(0.630, 0.580, 1.000);
  vec3 ice = vec3(0.690, 0.820, 1.000);
  vec3 gold = vec3(1.000, 0.720, 0.260);

  float vertical = smoothstep(0.0, 1.0, uv.y);
  vec3 color = mix(bgDeep, bgTop, vertical);
  color = mix(color, bgMid, nebula * 0.45);

  color += violet * largeLines * 0.34;
  color += electric * sharpLines * 0.48;
  color += ice * microLines * 0.18;
  color += gold * pow(max(energy - 0.72, 0.0), 2.0) * 1.8;

  color += violet * pointer * 0.24;
  color += electric * pointer * sharpLines * 0.55;

  float vignette = smoothstep(0.98, 0.20, radius);
  color *= mix(0.55, 1.08, vignette);

  float contrast = 1.12;
  color = (color - 0.5) * contrast + 0.5;

  gl_FragColor = vec4(color, 1.0);
}
`;

function NeuralField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerRef = useRef(new THREE.Vector2(0.45, 0.52));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.45, 0.52) },
    }),
    []
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.set(
        event.clientX / window.innerWidth,
        1 - event.clientY / window.innerHeight
      );
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uPointer.value.lerp(pointerRef.current, 0.075);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 160, 160]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={false}
        depthWrite={false}
        depthTest={false}
        blending={THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function HeroNeuralBackgroundScene() {
  return (
    <Canvas
      className="!absolute !inset-0 !h-full !w-full"
      camera={{ position: [0, 0, 1.6], fov: 52, near: 0.1, far: 10 }}
      dpr={[1.5, 2]}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <NeuralField />
    </Canvas>
  );
}