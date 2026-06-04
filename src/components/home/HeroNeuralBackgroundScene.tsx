"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type HeroNeuralBackgroundSceneProps = {
  isDark: boolean;
};

const vertexShader = `
precision highp float;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uRatio;
uniform float uTheme;
uniform float uDensity;
uniform float uCutoff;
uniform float uWaveOpacity;
uniform float uGlowOpacity;
uniform float uPointerStrength;
uniform vec2 uPointer;

vec2 rotate(vec2 uv, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, s, -s, c) * uv;
}

float neuroShape(vec2 uv, float t, float pointerPower) {
  vec2 sineAcc = vec2(0.0);
  vec2 result = vec2(0.0);

  float scale = uDensity;

  for (int j = 0; j < 10; j++) {
    uv = rotate(uv, 1.0);
    sineAcc = rotate(sineAcc, 1.0);

    vec2 layer = uv * scale + vec2(float(j)) + sineAcc - vec2(t);

    sineAcc += sin(layer) + 2.05 * pointerPower;
    result += (0.5 + 0.5 * cos(layer)) / scale;

    scale *= 1.18;
  }

  return result.x + result.y;
}

void main() {
  vec2 uv = vUv;

  vec2 aspectCenter = uv - 0.5;
  aspectCenter.x *= uRatio;

  float radius = length(aspectCenter);

  vec2 shaderUv = uv * 0.5;
  shaderUv.x *= uRatio;

  vec2 pointerVector = uv - uPointer;
  pointerVector.x *= uRatio;

  float pointerDistance = clamp(length(pointerVector), 0.0, 1.0);
  float pointerPower = 0.5 * pow(1.0 - pointerDistance, 2.0) * uPointerStrength;

  float t = uTime * 0.18;

  float field = neuroShape(shaderUv, t, pointerPower);

  field = 1.08 * pow(field, 3.0);
  field += 0.12 * pow(field, 8.0);
  field = max(0.0, field - uCutoff);

  float edgeFade = 1.0 - smoothstep(0.42, 0.94, radius);
  field *= edgeFade;

  /*
    Làm vùng chữ bên trái sạch hơn một chút.
    Nếu muốn sóng rõ hơn sau text, đổi 0.78 -> 0.88.
  */
  vec2 textZone = (uv - vec2(0.24, 0.52)) * vec2(1.0, 1.25);
  float textClear = 1.0 - smoothstep(0.18, 0.50, length(textZone));
  field *= mix(1.0, 0.78, textClear);

  float core = clamp(field, 0.0, 1.0);
  float glow = pow(core, 2.25);

  /*
    Background light: không trắng tuyệt đối để sóng tím có tương phản.
  */
  vec3 lightBgTop = vec3(0.988, 0.988, 1.000);   // #FCFCFF
  vec3 lightBgMid = vec3(0.955, 0.948, 0.982);   // tím rất nhạt
  vec3 lightBgDeep = vec3(0.972, 0.968, 0.992);

  /*
    Background dark: navy tím, không đen tuyền.
  */
  vec3 darkBgTop = vec3(0.055, 0.071, 0.145);
  vec3 darkBgMid = vec3(0.105, 0.075, 0.175);
  vec3 darkBgDeep = vec3(0.030, 0.035, 0.075);

  float vertical = smoothstep(0.0, 1.0, uv.y);

  float rightSpot = 1.0 - smoothstep(
    0.06,
    0.72,
    length((uv - vec2(0.72, 0.46)) * vec2(1.0, 0.78))
  );

  float leftSpot = 1.0 - smoothstep(
    0.04,
    0.90,
    length((uv - vec2(0.24, 0.48)) * vec2(1.18, 0.92))
  );

  vec3 lightBg = mix(lightBgMid, lightBgTop, vertical);
  lightBg = mix(lightBg, lightBgDeep, rightSpot * 0.36);
  lightBg = mix(lightBg, vec3(0.965, 0.958, 0.992), leftSpot * 0.14);

  vec3 darkBg = mix(darkBgDeep, darkBgTop, vertical);
  darkBg = mix(darkBg, darkBgMid, rightSpot * 0.52);
  darkBg = mix(darkBg, vec3(0.075, 0.055, 0.130), leftSpot * 0.18);

  /*
    Light mode: sóng tím rõ.
    Dark mode: sóng trắng sáng / lavender white.
  */
  vec3 lightLineA = vec3(0.290, 0.220, 0.520);   // tím đậm hơn để nổi trên nền sáng
  vec3 lightLineB = vec3(0.373, 0.290, 0.616);   // #5F4A9D
  vec3 lightGlow = vec3(0.549, 0.518, 0.800);    // #8C84CC

  vec3 darkLineA = vec3(0.760, 0.740, 0.900);
  vec3 darkLineB = vec3(0.920, 0.910, 1.000);
  vec3 darkGlow = vec3(1.000, 0.985, 0.940);

  float chroma = 0.5 + 0.5 * sin(uTime * 0.34 + core * 5.0);

  vec3 lightWave = mix(lightLineA, lightLineB, chroma);
  lightWave = mix(lightWave, lightGlow, glow * 0.30);

  vec3 darkWave = mix(darkLineA, darkLineB, chroma);
  darkWave = mix(darkWave, darkGlow, glow * 0.50);

  /*
    Điểm quan trọng:
    Light mode dùng mix để kéo nền sáng về tím.
    Dark mode dùng cộng sáng để tạo glow.
  */
  float lightLineMask = clamp(core * uWaveOpacity * 1.35, 0.0, 0.82);
  float lightGlowMask = clamp(glow * uGlowOpacity * 0.55, 0.0, 0.45);

  vec3 lightColor = lightBg;
  lightColor = mix(lightColor, lightWave, lightLineMask);
  lightColor += lightGlow * lightGlowMask;

  float darkLineMask = clamp(core * uWaveOpacity * 0.55, 0.0, 0.45);
  float darkGlowMask = clamp(glow * uGlowOpacity * 1.25, 0.0, 0.80);

  vec3 darkColor = darkBg;
  darkColor = mix(darkColor, darkWave, darkLineMask);
  darkColor += darkGlow * darkGlowMask;

  float pointerGlow = smoothstep(0.42, 0.0, pointerDistance);

  lightColor = mix(
    lightColor,
    lightGlow,
    pointerGlow * core * uPointerStrength * 0.28
  );

  darkColor += darkGlow * pointerGlow * glow * uPointerStrength * 0.34;

  vec3 finalColor = mix(lightColor, darkColor, uTheme);
  finalColor = clamp(finalColor, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

function NeuralField({ isDark }: HeroNeuralBackgroundSceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointerTargetRef = useRef(new THREE.Vector2(0.64, 0.52));

  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRatio: { value: 1 },
      uTheme: { value: isDark ? 1 : 0 },
      uDensity: { value: 5.1 },
      uCutoff: { value: 0.46 },
      uWaveOpacity: { value: 0.62 },
      uGlowOpacity: { value: 0.32 },
      uPointerStrength: { value: 0.44 },
      uPointer: { value: new THREE.Vector2(0.64, 0.52) },
    }),
    []
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerTargetRef.current.set(
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

    const u = materialRef.current.uniforms;

    u.uTime.value = clock.getElapsedTime();
    u.uRatio.value = size.width / Math.max(size.height, 1);
    u.uPointer.value.lerp(pointerTargetRef.current, 0.075);

    u.uTheme.value = isDark ? 1 : 0;

    /*
      Light:
      - cutoff thấp hơn để sóng không biến mất.
      - opacity cao hơn vì phải nổi trên nền sáng.

      Dark:
      - cutoff cao hơn để bớt rườm rà.
      - glow cao hơn để sóng trắng sáng hơn.
    */
    u.uDensity.value = isDark ? 8.15 : 8.05;
    u.uCutoff.value = isDark ? 0.04 : 0.06;
    u.uWaveOpacity.value = isDark ? 0.46 : 0.68;
    u.uGlowOpacity.value = isDark ? 0.46 : 8.64;
    u.uPointerStrength.value = isDark ? 1.9 : 2.0;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
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

export default function HeroNeuralBackgroundScene({
  isDark,
}: HeroNeuralBackgroundSceneProps) {
  return (
    <Canvas
      className="!absolute !inset-0 !h-full !w-full"
      camera={{ position: [0, 0, 1.6], fov: 52, near: 0.1, far: 10 }}
      dpr={[1, 1.6]}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <NeuralField isDark={isDark} />
    </Canvas>
  );
}