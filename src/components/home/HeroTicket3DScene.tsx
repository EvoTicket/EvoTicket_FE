"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, Preload, useGLTF } from "@react-three/drei";

const MODEL_URL = "/models/evoticket-hero-ticket.glb";

type PointerCaptureTarget = EventTarget & {
    setPointerCapture?: (pointerId: number) => void;
    releasePointerCapture?: (pointerId: number) => void;
    hasPointerCapture?: (pointerId: number) => boolean;
};

const DEFAULT_ROTATION_X = 0;
const DEFAULT_ROTATION_Y = Math.PI;
const DEFAULT_ROTATION_Z = -0.04;

type AnimatedNode = {
    object: THREE.Object3D;
    baseScale: THREE.Vector3;
};

function isTicketNodeObject(name: string) {
    const normalizedName = name.toLowerCase();

    const maybeNode =
        normalizedName.includes("node") ||
        normalizedName.includes("dot") ||
        normalizedName.includes("point") ||
        normalizedName.includes("halo");

    const notLine =
        !normalizedName.includes("line") &&
        !normalizedName.includes("curve") &&
        !normalizedName.includes("path");

    return maybeNode && notLine;
}

function CameraLight() {
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame(({ camera }) => {
        if (!lightRef.current) return;

        lightRef.current.position.copy(camera.position);
        lightRef.current.position.x += 0.6;
        lightRef.current.position.y += 0.6;
    });

    return (
        <pointLight
            ref={lightRef}
            intensity={3.2}
            distance={18}
            decay={1.4}
            color="#ffffff"
        />
    );
}

/**
 * 1 orb sáng nhỏ + point light đi theo quỹ đạo ellipse
 */
function FlowOrb({
    radiusX,
    radiusY,
    speed,
    offset = 0,
    color = "#A998FF",
    size = 0.07,
    lightIntensity = 1.2,
    zAmplitude = 0.9,
}: {
    radiusX: number;
    radiusY: number;
    speed: number;
    offset?: number;
    color?: string;
    size?: number;
    lightIntensity?: number;
    zAmplitude?: number;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * speed + offset;

        const x = Math.cos(t) * radiusX;
        const y = Math.sin(t * 1.15) * radiusY;
        const z = Math.sin(t) * zAmplitude;

        if (groupRef.current) {
            groupRef.current.position.set(x, y, z);
            const pulse = 1 + Math.sin(t * 2.4) * 0.18;
            groupRef.current.scale.setScalar(pulse);
        }

        if (lightRef.current) {
            lightRef.current.position.set(x, y, z);
            lightRef.current.intensity =
                lightIntensity + Math.sin(t * 2.2) * 0.25;
        }
    });

    return (
        <>
            <group ref={groupRef}>
                <mesh>
                    <sphereGeometry args={[size, 50, 50]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.95}
                        toneMapped={false}
                    />
                </mesh>

                {/* quầng sáng mềm */}
                <mesh scale={2.4}>
                    <sphereGeometry args={[size, 60, 60]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.16}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </mesh>
            </group>

            <pointLight
                ref={lightRef}
                color={color}
                intensity={lightIntensity}
                distance={2.5}
                decay={2}
            />
        </>
    );
}

function LightFlow() {
    return (
        <group>
            <FlowOrb
                radiusX={3}
                radiusY={5}
                speed={0.9}
                offset={0}
                color="#A998FF"
                size={0.07}
                lightIntensity={1.0}
                zAmplitude={1}
            />

            <FlowOrb
                radiusX={3}
                radiusY={5}
                speed={1.15}
                offset={1}
                color="#DFA92A"
                size={0.05}
                lightIntensity={0.9}
                zAmplitude={0.7}
            />

            <FlowOrb
                radiusX={3}
                radiusY={6}
                speed={0.75}
                offset={6}
                color="#CFC6FF"
                size={0.09}
                lightIntensity={1}
                zAmplitude={1.05}
            />
        </group>
    );
}

function TicketModel() {
    const gltf = useGLTF(MODEL_URL);

    const groupRef = useRef<THREE.Group>(null);
    const animatedNodesRef = useRef<AnimatedNode[]>([]);

    const isDraggingRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });

    const targetRotationRef = useRef({
        x: DEFAULT_ROTATION_X,
        y: DEFAULT_ROTATION_Y,
        z: DEFAULT_ROTATION_Z,
    });

    const scene = useMemo(() => {
        const clonedScene = gltf.scene.clone(true);

        clonedScene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;

                mesh.frustumCulled = false;

                if (Array.isArray(mesh.material)) {
                    mesh.material = mesh.material.map((material) => material.clone());
                } else if (mesh.material) {
                    mesh.material = mesh.material.clone();
                }
            }
        });

        return clonedScene;
    }, [gltf.scene]);

    useEffect(() => {
        const animatedNodes: AnimatedNode[] = [];

        scene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;
                const materials = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];

                materials.forEach((material) => {
                    if (!material) return;

                    material.side = THREE.DoubleSide;

                    if ("color" in material && material.color instanceof THREE.Color) {
                        material.color.multiplyScalar(1.12);
                    }

                    if ("roughness" in material && typeof material.roughness === "number") {
                        material.roughness = Math.min(material.roughness, 0.68);
                    }

                    if ("metalness" in material && typeof material.metalness === "number") {
                        material.metalness = Math.min(material.metalness, 0.18);
                    }

                    if ("emissiveIntensity" in material) {
                        material.emissiveIntensity = Math.max(
                            Number(material.emissiveIntensity || 0),
                            0.45
                        );
                    }

                    material.needsUpdate = true;
                });

                if (isTicketNodeObject(object.name)) {
                    animatedNodes.push({
                        object,
                        baseScale: object.scale.clone(),
                    });
                }
            }
        });

        animatedNodesRef.current = animatedNodes;
        // console.log(
        //     "Animated node objects:",
        //     animatedNodes.map((item) => item.object.name)
        // );
    }, [scene]);

    useFrame((state, delta) => {
        const group = groupRef.current;
        if (!group) return;

        const target = targetRotationRef.current;

        if (!isDraggingRef.current) {
            target.x = THREE.MathUtils.lerp(target.x, DEFAULT_ROTATION_X, 0.035);
            target.y = THREE.MathUtils.lerp(target.y, DEFAULT_ROTATION_Y, 0.045);
            target.z = THREE.MathUtils.lerp(target.z, DEFAULT_ROTATION_Z, 0.055);
        }

        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, target.x, 0.05);
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target.y, 0.06);
        group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target.z, 0.07);

        // floating nhẹ
        group.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.3;

        // animate các node trên ticket
        animatedNodesRef.current.forEach((item, index) => {
            const phase = index * 0.7;
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4 + phase) * 0.52;

            item.object.scale.set(
                item.baseScale.x * pulse,
                item.baseScale.y * pulse,
                item.baseScale.z * pulse
            );

            item.object.rotation.x += delta * (0.35 + index * 0.3);
            item.object.rotation.y += delta * (0.55 + index * 0.4);
            item.object.rotation.z += delta * (0.75 + index * 0.5);
        });
    });

    return (
        <Center>
            <group
                ref={groupRef}
                scale={1.22}
                onPointerDown={(event) => {
                    event.stopPropagation();

                    isDraggingRef.current = true;
                    lastPointerRef.current = {
                        x: event.clientX,
                        y: event.clientY,
                    };

                    const target = event.target as PointerCaptureTarget;
                    target.setPointerCapture?.(event.pointerId);
                }}
                onPointerMove={(event) => {
                    if (!isDraggingRef.current) return;

                    event.stopPropagation();

                    const deltaX = event.clientX - lastPointerRef.current.x;
                    const deltaY = event.clientY - lastPointerRef.current.y;

                    lastPointerRef.current = {
                        x: event.clientX,
                        y: event.clientY,
                    };

                    const target = targetRotationRef.current;

                    target.y += deltaX * 0.006;
                    target.x += deltaY * 0.004;

                    target.x = THREE.MathUtils.clamp(
                        target.x,
                        DEFAULT_ROTATION_X - 0.32,
                        DEFAULT_ROTATION_X + 0.32
                    );

                    target.y = THREE.MathUtils.clamp(
                        target.y,
                        DEFAULT_ROTATION_Y - 0.58,
                        DEFAULT_ROTATION_Y + 0.58
                    );

                    target.z =
                        DEFAULT_ROTATION_Z + (target.y - DEFAULT_ROTATION_Y) * 0.08;
                }}
                onPointerUp={(event) => {
                    event.stopPropagation();

                    isDraggingRef.current = false;

                    const target = event.target as PointerCaptureTarget;
                    if (!target.hasPointerCapture || target.hasPointerCapture(event.pointerId)) {
                        target.releasePointerCapture?.(event.pointerId);
                    }
                }}
                onPointerCancel={() => {
                    isDraggingRef.current = false;
                }}
                onPointerLeave={() => {
                    isDraggingRef.current = false;
                }}
            >
                <primitive object={scene} />
            </group>
        </Center>
    );
}

export default function HeroTicket3DScene() {
    return (
        <div className="relative h-[450px] w-full md:w-[85%] md:h-[600px] mx-auto">
            <Canvas className="!h-full !w-full"
                camera={{
                    position: [0, 0, 5.4],
                    fov: 33,
                    near: 0.1,
                    far: 1000,
                }}
                dpr={[1, 1.5]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
            >
                {/* Không background */}

                <ambientLight intensity={1.15} />
                <hemisphereLight args={["#F4F1FB", "#1F1229", 1.35]} />

                <CameraLight />

                <directionalLight
                    position={[0, 4, 6]}
                    intensity={2.25}
                    color="#ffffff"
                />

                <directionalLight
                    position={[-4, 2, 3]}
                    intensity={1.15}
                    color="#CFC4EB"
                />

                <pointLight
                    position={[3, -2, 4]}
                    intensity={0.95}
                    color="#DFA92A"
                />

                <Suspense fallback={null}>
                    {/* fit chỉ ticket */}
                    <Bounds fit clip observe margin={0.82}>
                        <TicketModel />
                    </Bounds>

                    {/* light flow nằm ngoài Bounds để không làm camera fit sai */}
                    <LightFlow />

                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}

useGLTF.preload(MODEL_URL);