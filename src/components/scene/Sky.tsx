"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * Full-screen sky drawn behind everything: a gradient, the sun, the moon and stars.
 *
 * `day` is driven by the scene (0 = night, 1 = day). When the theme changes, the new sky is
 * revealed as a circle that grows from `origin` (the toggle button, in screen 0..1 coordinates),
 * then the sun rises or sets inside it. Everything is computed in the shader, so the 3D scene
 * keeps rendering live during the transition.
 */
export type SkyState = {
  /** Sky the reveal starts from and the one it ends on: 0 = night, 1 = day. */
  from: number;
  to: number;
  /** Radius of the reveal circle, in screen heights. */
  reveal: number;
  /** How far the sun has risen (0 below the horizon, 1 up), and the same for the moon. */
  sun: number;
  moon: number;
  origin: THREE.Vector2;
  /** Horizontal position of the sun and moon (0..1), moved to the side without text. */
  x: number;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // A quad in clip space at the far plane: fills the screen whatever the camera does.
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uFrom;
  uniform float uTo;
  uniform float uReveal;
  uniform float uSun;
  uniform float uMoon;
  uniform vec2 uOrigin;
  uniform float uX;
  uniform float uAspect;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec3 skyColor(float day, vec2 uv) {
    // Night: deep violet-black like the dark theme. Day: soft blue to a warm horizon.
    vec3 nightTop = vec3(0.020, 0.018, 0.040);
    vec3 nightLow = vec3(0.070, 0.045, 0.140);
    // Kept below 1.0 so the bloom pass (threshold 1.0) leaves the sky alone and only the sun glows.
    vec3 dayTop = vec3(0.560, 0.735, 0.960);
    vec3 dayLow = vec3(0.985, 0.905, 0.820);
    float h = smoothstep(0.0, 1.0, uv.y);
    vec3 night = mix(nightLow, nightTop, h);
    vec3 dayc = mix(dayLow, dayTop, h);
    return mix(night, dayc, day);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y);

    // Which sky this pixel shows: the new one inside the growing circle, the old one outside.
    float d = distance(p, vec2(uOrigin.x * uAspect, uOrigin.y));
    float inside = 1.0 - smoothstep(uReveal - 0.04, uReveal, d);
    float day = mix(uFrom, uTo, inside);

    vec3 col = skyColor(day, uv);

    // Stars, only at night, twinkling.
    vec2 grid = floor(p * 90.0);
    float star = step(0.992, hash(grid));
    vec2 cell = fract(p * 90.0) - 0.5;
    float twinkle = 0.55 + 0.45 * sin(uTime * 2.0 + hash(grid + 7.0) * 40.0);
    float starLight = star * twinkle * smoothstep(0.18, 0.0, length(cell)) * (1.0 - day);
    col += vec3(0.85, 0.85, 1.0) * starLight * smoothstep(0.25, 0.6, uv.y);

    // Sun: rises from below the horizon on the right, with a large warm halo.
    vec2 sunPos = vec2(uX * uAspect, mix(-0.25, 0.78, uSun));
    float sd = distance(p, sunPos);
    float sunDisc = 1.0 - smoothstep(0.052, 0.058, sd);
    float sunHalo = exp(-sd * 9.0) * 0.22 + exp(-sd * 26.0) * 0.35;
    float sunVis = day;
    col = mix(col, vec3(1.0, 0.80, 0.42) * 1.35, sunDisc * sunVis);
    col += vec3(1.0, 0.62, 0.28) * sunHalo * sunVis * uSun;
    col = min(col, vec3(1.6));

    // Moon: a crescent that sinks when the day comes.
    vec2 moonPos = vec2(uX * uAspect, mix(-0.25, 0.80, uMoon));
    float md = distance(p, moonPos);
    float moonDisc = 1.0 - smoothstep(0.040, 0.044, md);
    float cut = 1.0 - smoothstep(0.036, 0.040, distance(p, moonPos + vec2(0.018, 0.012)));
    float crescent = moonDisc * (1.0 - cut);
    float moonHalo = exp(-md * 14.0) * 0.35;
    float moonVis = 1.0 - day;
    col = mix(col, vec3(0.96, 0.94, 1.0) * 1.3, crescent * moonVis);
    col += vec3(0.55, 0.45, 1.0) * moonHalo * moonVis * uMoon;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Sky({ state }: { state: React.RefObject<SkyState> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uFrom: { value: 0 },
          uTo: { value: 0 },
          uReveal: { value: 0 },
          uSun: { value: 0 },
          uMoon: { value: 1 },
          uOrigin: { value: new THREE.Vector2(0.9, 0.95) },
          uX: { value: 0.8 },
          uAspect: { value: 1 },
          uTime: { value: 0 },
        },
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useFrame(({ clock, size }) => {
    const s = state.current;
    const u = material.uniforms;
    u.uFrom.value = s.from;
    u.uTo.value = s.to;
    u.uReveal.value = s.reveal;
    u.uSun.value = s.sun;
    u.uMoon.value = s.moon;
    u.uOrigin.value.copy(s.origin);
    u.uX.value = s.x;
    u.uAspect.value = size.width / size.height;
    u.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
