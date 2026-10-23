"use client";

import { Component, useEffect, useState } from "react";

/** True when the browser can give us a WebGL context right now (it may be disabled or blocked). */
function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    // Hand the test context back straight away; browsers allow only a few at a time.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

class Boundary extends Component<{ onError: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D scene disabled:", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Renders the 3D scene only where it can run, and turns it off for good if it fails
 * (no WebGL, a render error, or the GPU dropping the context). The page keeps working
 * without it; `onUnavailable` lets it close the loading screen instead of waiting.
 */
export function SceneGuard({ children, onUnavailable }: { children: React.ReactNode; onUnavailable: () => void }) {
  const [state, setState] = useState<"checking" | "on" | "off">("checking");

  useEffect(() => {
    setState(webglAvailable() ? "on" : "off");
  }, []);

  useEffect(() => {
    if (state === "off") onUnavailable();
  }, [state, onUnavailable]);

  // A lost context usually means the GPU reset; trying again can get the site blocked by the browser.
  useEffect(() => {
    if (state !== "on") return;
    const onLost = (e: Event) => {
      if ((e.target as HTMLElement | null)?.tagName !== "CANVAS") return;
      console.warn("WebGL context lost; 3D scene disabled.");
      setState("off");
    };
    window.addEventListener("webglcontextlost", onLost, true);
    return () => window.removeEventListener("webglcontextlost", onLost, true);
  }, [state]);

  if (state !== "on") return null;
  return <Boundary onError={() => setState("off")}>{children}</Boundary>;
}
