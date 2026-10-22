import * as THREE from "three";
import { getTech, isDarkBrand } from "@/content/tech";

/**
 * Screen and logo textures for the 3D scene, drawn on a <canvas> at runtime
 * so the site ships no screenshots or image assets for them.
 */

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const MONO = "ui-monospace, 'Cascadia Code', Consolas, monospace";
const SANS = "Manrope, ui-sans-serif, system-ui, sans-serif";

function make(w: number, h: number, draw: Draw) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, weight = 600, font = SANS) {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

/** Deterministic QR-like pattern so every render looks the same. */
function qr(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, seed = 7) {
  const n = 25;
  const cell = size / n;
  box(ctx, x - cell, y - cell, size + cell * 2, size + cell * 2, cell, "#ffffff");
  const finder = (fx: number, fy: number) => fx < 7 && fy < 7;
  const isFinder = (cx: number, cy: number) =>
    finder(cx, cy) || finder(cx - (n - 7), cy) || finder(cx, cy - (n - 7));
  let s = seed;
  ctx.fillStyle = "#111118";
  for (let cy = 0; cy < n; cy++) {
    for (let cx = 0; cx < n; cx++) {
      s = (s * 9301 + 49297) % 233280;
      if (!isFinder(cx, cy) && s / 233280 > 0.52) ctx.fillRect(x + cx * cell, y + cy * cell, cell * 0.92, cell * 0.92);
    }
  }
  for (const [fx, fy] of [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]) {
    box(ctx, x + fx * cell, y + fy * cell, cell * 7, cell * 7, cell * 1.4, "#111118");
    box(ctx, x + (fx + 1) * cell, y + (fy + 1) * cell, cell * 5, cell * 5, cell, "#ffffff");
    box(ctx, x + (fx + 2) * cell, y + (fy + 2) * cell, cell * 3, cell * 3, cell * 0.6, "#111118");
  }
}

function windowChrome(ctx: CanvasRenderingContext2D, w: number, title: string) {
  box(ctx, 0, 0, w, 44, 0, "#15151f");
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => box(ctx, 20 + i * 24, 15, 14, 14, 7, c));
  text(ctx, title, 110, 29, 17, "#8d8c9c", 500, MONO);
}

/* ---------- Laptop screens ---------- */

export function codeTexture() {
  const C = { kw: "#c792ea", fn: "#82aaff", str: "#c3e88d", tag: "#f07178", fg: "#d6d6e0", mute: "#5d5d72", num: "#f78c6c" };
  const lines: [string, keyof typeof C][][] = [
    [["import", "kw"], [" { motion } ", "fg"], ["from", "kw"], [' "motion/react"', "str"], [";", "fg"]],
    [["import", "kw"], [" { Canvas } ", "fg"], ["from", "kw"], [' "@react-three/fiber"', "str"], [";", "fg"]],
    [],
    [["export function ", "kw"], ["Portfolio", "fn"], ["() {", "fg"]],
    [["  const ", "kw"], ["[section, setSection] = ", "fg"], ["useState", "fn"], ["(", "fg"], ["0", "num"], [");", "fg"]],
    [],
    [["  return", "kw"], [" (", "fg"]],
    [["    <", "fg"], ["main", "tag"], [">", "fg"]],
    [["      <", "fg"], ["Canvas", "tag"], [" camera", "fn"], ["={{ fov: ", "fg"], ["35", "num"], [" }}>", "fg"]],
    [["        <", "fg"], ["Scene", "tag"], [" section", "fn"], ["={section} />", "fg"]],
    [["      </", "fg"], ["Canvas", "tag"], [">", "fg"]],
    [["      <", "fg"], ["motion.section", "tag"], [" animate", "fn"], ['="center"', "str"], [">", "fg"]],
    [["        <", "fg"], ["h1", "tag"], [">", "fg"], ["Bùi Hoàng Phi", "fg"], ["</", "fg"], ["h1", "tag"], [">", "fg"]],
    [["      </", "fg"], ["motion.section", "tag"], [">", "fg"]],
    [["    </", "fg"], ["main", "tag"], [">", "fg"]],
    [["  );", "fg"]],
    [["}", "fg"]],
  ];
  return make(1024, 640, (ctx, w, h) => {
    box(ctx, 0, 0, w, h, 0, "#0d0d14");
    windowChrome(ctx, w, "Portfolio.tsx — portfolio");
    box(ctx, 0, 44, 56, h - 44, 0, "#101019");
    lines.forEach((tokens, i) => {
      const y = 86 + i * 31;
      text(ctx, String(i + 1).padStart(2, " "), 14, y, 17, C.mute, 400, MONO);
      let x = 76;
      ctx.font = `500 19px ${MONO}`;
      for (const [s, c] of tokens) {
        ctx.fillStyle = C[c];
        ctx.fillText(s, x, y);
        x += ctx.measureText(s).width;
      }
      if (i === 12) box(ctx, x + 4, y - 18, 3, 22, 1, "#b4a3ff");
    });
  });
}

export function dashboardTexture() {
  return make(1024, 640, (ctx, w, h) => {
    box(ctx, 0, 0, w, h, 0, "#0f0f17");
    windowChrome(ctx, w, "ems.webie.com.vn/admin");
    box(ctx, 0, 44, 190, h - 44, 0, "#13131d");
    text(ctx, "Webie EMS", 24, 88, 22, "#ededf2", 800);
    ["Dashboard", "Events", "Guests", "News", "Maps", "Export"].forEach((s, i) => {
      if (i === 0) box(ctx, 14, 112 + i * 46, 162, 36, 8, "rgba(140,123,255,0.18)");
      text(ctx, s, 30, 136 + i * 46, 17, i === 0 ? "#b4a3ff" : "#8d8c9c", 600);
    });
    const stats = [
      ["Events", "128"],
      ["Guests", "3.4k"],
      ["Check-in", "92%"],
      ["News", "24"],
    ];
    stats.forEach(([k, v], i) => {
      const x = 214 + i * 200;
      box(ctx, x, 70, 184, 104, 14, "#181824");
      text(ctx, k, x + 18, 104, 16, "#8d8c9c", 600);
      text(ctx, v, x + 18, 152, 36, "#ededf2", 800);
    });
    box(ctx, 214, 192, 520, 300, 14, "#181824");
    text(ctx, "Registrations", 234, 226, 17, "#ededf2", 700);
    const bars = [40, 62, 48, 80, 58, 95, 72, 86, 64, 100];
    bars.forEach((b, i) => {
      const bh = (b / 100) * 210;
      box(ctx, 240 + i * 48, 470 - bh, 30, bh, 6, i === 5 ? "#8c7bff" : "rgba(237,237,242,0.16)");
    });
    box(ctx, 750, 192, 250, 300, 14, "#181824");
    text(ctx, "Upcoming", 770, 226, 17, "#ededf2", 700);
    ["Tech Summit", "Job Fair", "Workshop", "Gala Night"].forEach((s, i) => {
      box(ctx, 770, 248 + i * 58, 40, 40, 10, ["#8c7bff", "#4fd1e8", "#ff9a5c", "#2fd28b"][i]);
      text(ctx, s, 824, 274 + i * 58, 16, "#d6d6e0", 600);
    });
    box(ctx, 214, 510, 786, 110, 14, "#181824");
    for (let i = 0; i < 3; i++) {
      box(ctx, 234, 532 + i * 30, 260, 12, 6, "rgba(237,237,242,0.14)");
      box(ctx, 560, 532 + i * 30, 160, 12, 6, "rgba(237,237,242,0.08)");
      box(ctx, 880, 530 + i * 30, 90, 16, 8, "rgba(47,210,139,0.35)");
    }
  });
}

export function shopTexture() {
  return make(1024, 640, (ctx, w, h) => {
    box(ctx, 0, 0, w, h, 0, "#f6f5f2");
    box(ctx, 0, 0, w, 44, 0, "#e4e2dc");
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => box(ctx, 20 + i * 24, 15, 14, 14, 7, c));
    text(ctx, "shop.example.de", 110, 29, 17, "#77736a", 500, MONO);
    text(ctx, "Arbeitsschutz", 40, 100, 28, "#1b1a17", 800);
    box(ctx, 760, 72, 224, 42, 21, "#1b1a17");
    text(ctx, "Geschäftskonto", 800, 100, 17, "#ffffff", 700);
    const items = [
      ["Arbeitsjacke", "€64,50"],
      ["Sicherheitsschuh", "€89,00"],
      ["Schutzbrille", "€12,90"],
      ["Handschuhe", "€7,40"],
    ];
    items.forEach(([name, price], i) => {
      const x = 40 + i * 240;
      box(ctx, x, 140, 220, 380, 16, "#ffffff");
      const g = ctx.createLinearGradient(x, 156, x + 188, 330);
      g.addColorStop(0, "#e9e6df");
      g.addColorStop(1, "#d8d4ca");
      box(ctx, x + 16, 156, 188, 190, 12, "#e9e6df");
      ctx.fillStyle = g;
      ctx.fill();
      text(ctx, name, x + 16, 384, 18, "#1b1a17", 700);
      text(ctx, price, x + 16, 418, 20, "#d1560f", 800);
      box(ctx, x + 150, 400, 54, 24, 12, "#ece9e2");
      text(ctx, "B2B", x + 162, 418, 14, "#5a564d", 800);
      box(ctx, x + 16, 448, 188, 46, 10, i === 1 ? "#ff9a5c" : "#1b1a17");
      text(ctx, "In den Warenkorb", x + 34, 477, 15, "#ffffff", 700);
    });
    text(ctx, "Preise für Geschäftskunden nach Freigabe sichtbar", 40, 580, 18, "#77736a", 600);
  });
}

export function checkoutTexture() {
  return make(1024, 640, (ctx, w, h) => {
    box(ctx, 0, 0, w, h, 0, "#0e1412");
    windowChrome(ctx, w, "checkout / order #1234");
    box(ctx, 60, 90, 420, 500, 20, "#f7f7f5");
    text(ctx, "VietQR", 92, 136, 20, "#111118", 800);
    qr(ctx, 110, 166, 320);
    text(ctx, "1.250.000 ₫", 92, 548, 30, "#111118", 800);
    text(ctx, "DH1234", 380, 548, 20, "#5a5a66", 700, MONO);
    text(ctx, "Order #1234", 540, 150, 34, "#ededf2", 800);
    text(ctx, "Waiting for transfer… → paid", 540, 196, 19, "#8d9a95", 600);
    box(ctx, 540, 236, 400, 70, 16, "rgba(47,210,139,0.16)");
    text(ctx, "✓  Payment received", 568, 280, 24, "#2fd28b", 800);
    ["Bank", "Account", "Amount", "Note"].forEach((k, i) => {
      text(ctx, k, 540, 368 + i * 52, 18, "#8d9a95", 600);
      box(ctx, 700, 352 + i * 52, 240, 18, 9, "rgba(237,237,242,0.14)");
    });
  });
}

/* ---------- Phone screen ---------- */

export function phoneTexture() {
  return make(512, 1080, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#151327");
    g.addColorStop(1, "#0b0b14");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    text(ctx, "9:41", 40, 56, 22, "#ededf2", 700);
    box(ctx, 196, 30, 120, 34, 17, "#000000");
    text(ctx, "My tickets", 40, 140, 36, "#ededf2", 800);
    text(ctx, "Webie EMS", 40, 178, 20, "#8d8c9c", 600);
    box(ctx, 32, 214, 448, 690, 32, "#1d1b33");
    const hg = ctx.createLinearGradient(32, 214, 480, 420);
    hg.addColorStop(0, "#8c7bff");
    hg.addColorStop(1, "#4fd1e8");
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(32, 214, 448, 170, [32, 32, 0, 0]);
    ctx.fillStyle = hg;
    ctx.fill();
    ctx.restore();
    text(ctx, "Tech Summit 2026", 60, 280, 30, "#0b0716", 800);
    text(ctx, "Sat 14 Nov · 09:00", 60, 320, 20, "#1b1640", 700);
    text(ctx, "Hall A · Seat 24", 60, 352, 20, "#1b1640", 700);
    qr(ctx, 106, 430, 300, 11);
    text(ctx, "Show this code at the door", 96, 800, 20, "#8d8c9c", 600);
    box(ctx, 60, 830, 392, 56, 28, "#b4a3ff");
    text(ctx, "Add to wallet", 186, 866, 20, "#0b0716", 800);
    box(ctx, 32, 930, 448, 110, 28, "#16152a");
    ["Tickets", "Scan", "News", "Photos"].forEach((s, i) => {
      box(ctx, 72 + i * 104, 952, 36, 36, 10, i === 0 ? "#b4a3ff" : "rgba(237,237,242,0.18)");
      text(ctx, s, 62 + i * 104, 1018, 15, i === 0 ? "#ededf2" : "#8d8c9c", 700);
    });
  });
}

/* ---------- Keyboard deck ---------- */

export function keyboardTexture() {
  return make(1024, 360, (ctx, w, h) => {
    box(ctx, 0, 0, w, h, 0, "#1c1c24");
    const rows = [14, 14, 13, 12, 9];
    rows.forEach((count, r) => {
      const keyW = (w - 40 - (count - 1) * 8) / count;
      for (let k = 0; k < count; k++) {
        const isSpace = r === 4 && k === 4;
        box(ctx, 20 + k * (keyW + 8), 16 + r * 68, isSpace ? keyW : keyW, 58, 8, isSpace ? "#2b2b36" : "#101016");
      }
    });
  });
}

/* ---------- Tech logo tiles ---------- */

export function logoTexture(name: string) {
  const t = getTech(name);
  return make(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#1d1c28");
    g.addColorStop(1, "#121219");
    box(ctx, 0, 0, w, h, 44, "#000");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();
    if (!t.path || !t.hex) return;
    ctx.save();
    ctx.translate(58, 58);
    ctx.scale(140 / 24, 140 / 24);
    ctx.fillStyle = isDarkBrand(t.hex) ? "#ededf2" : t.hex;
    ctx.fill(new Path2D(t.path));
    ctx.restore();
  });
}

/* ---------- Soft glow behind the character ---------- */

export function glowTexture(color = "140,110,255") {
  return make(512, 512, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, `rgba(${color},0.85)`);
    g.addColorStop(0.35, `rgba(${color},0.35)`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Dark blurred ellipse used as a cheap contact shadow under the desk. */
export function shadowTexture() {
  return make(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ---------- Phjn Coffee menu ---------- */

export function coffeeTexture() {
  return make(1024, 640, (ctx, w, h) => {
    box(ctx, 0, 0, w, h, 0, "#f5ede3");
    box(ctx, 0, 0, w, 44, 0, "#e6d9c8");
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => box(ctx, 20 + i * 24, 15, 14, 14, 7, c));
    text(ctx, "phjn-coffee.vercel.app/menu?ban=5", 110, 29, 17, "#8a7562", 500, MONO);

    text(ctx, "Phjn Coffee", 40, 100, 30, "#3b2416", 800);
    box(ctx, 236, 74, 96, 34, 17, "#3b2416");
    text(ctx, "Bàn 05", 254, 97, 17, "#f5ede3", 700);
    box(ctx, 846, 70, 138, 42, 21, "#c8823f");
    text(ctx, "Giỏ · 3", 878, 98, 18, "#ffffff", 800);

    ["Cà phê", "Trà sữa", "Trà trái cây", "Nước ép", "Bánh"].forEach((s, i) => {
      const x = 40 + i * 150;
      if (i === 0) box(ctx, x - 12, 132, 128, 38, 19, "#3b2416");
      text(ctx, s, x, 158, 17, i === 0 ? "#f5ede3" : "#8a7562", 700);
    });

    const items = [
      ["Cà phê sữa đá", "29.000đ", "#6b4428", "#e9d3b6"],
      ["Bạc xỉu", "32.000đ", "#a8774d", "#f1e2cc"],
      ["Cà phê muối", "35.000đ", "#5a3a22", "#efe5d6"],
      ["Cold brew cam sả", "45.000đ", "#3f2516", "#f3b35b"],
    ];
    items.forEach(([name, price, drink, top], i) => {
      const x = 40 + i * 240;
      box(ctx, x, 196, 220, 400, 18, "#fffaf4");
      // Arched photo frame with a glass of the drink inside.
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 16, 212, 188, 220, [94, 94, 14, 14]);
      ctx.fillStyle = "#ead9c4";
      ctx.fill();
      ctx.clip();
      box(ctx, x + 70, 260, 80, 150, 14, "rgba(255,255,255,0.55)");
      box(ctx, x + 76, 300, 68, 104, 10, drink);
      box(ctx, x + 76, 290, 68, 22, 10, top);
      box(ctx, x + 104, 236, 8, 70, 4, "#c8823f");
      ctx.restore();
      text(ctx, name, x + 16, 466, 19, "#3b2416", 800);
      text(ctx, price, x + 16, 498, 19, "#c8823f", 800);
      ["M", "L"].forEach((s, k) => {
        box(ctx, x + 16 + k * 46, 516, 38, 28, 14, k === 0 ? "#3b2416" : "#efe3d4");
        text(ctx, s, x + 29 + k * 46, 536, 15, k === 0 ? "#fffaf4" : "#8a7562", 800);
      });
      box(ctx, x + 150, 512, 54, 36, 18, "#c8823f");
      text(ctx, "+", x + 170, 538, 24, "#ffffff", 800);
    });
  });
}
