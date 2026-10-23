import type { Project } from "@/content/projects";

/** Illustrations drawn with HTML/SVG so the site needs no screenshots to look finished. */
export function ProjectVisual({ project }: { project: Project }) {
  switch (project.visual) {
    case "vietqr":
      return <VietQRVisual accent={project.accent} />;
    case "ems":
      return <EmsVisual accent={project.accent} />;
    case "woo":
      return <WooVisual accent={project.accent} />;
    case "coffee":
      return <CoffeeVisual accent={project.accent} />;
  }
}

/* ---------- VietQR ---------- */

const QR_SIZE = 25;

function isFinder(x: number, y: number) {
  const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return inBox(0, 0) || inBox(QR_SIZE - 7, 0) || inBox(0, QR_SIZE - 7);
}

// Deterministic pseudo-random modules so server and client render the same pattern.
const qrCells: [number, number][] = (() => {
  const cells: [number, number][] = [];
  let seed = 1234;
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      seed = (seed * 9301 + 49297) % 233280;
      if (!isFinder(x, y) && seed / 233280 > 0.52) cells.push([x, y]);
    }
  }
  return cells;
})();

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} rx={1.4} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={1} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
    </g>
  );
}

function VietQRVisual({ accent }: { accent: string }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative w-[46%] max-w-[230px] min-w-[180px] rotate-[-4deg] rounded-[28px] border border-white/10 bg-[#111] p-2 shadow-2xl shadow-black/40 transition-transform duration-700 group-hover:rotate-0">
        <div className="rounded-[22px] bg-[#f7f7f5] p-4 text-[#111]">
          <div className="mb-3 flex items-center justify-between text-[9px] font-semibold tracking-wide uppercase opacity-60">
            <span>VietQR</span>
            <span>Napas 247</span>
          </div>
          <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} className="aspect-square w-full text-[#111]">
            <rect x={-1} y={-1} width={QR_SIZE + 2} height={QR_SIZE + 2} rx={2} fill="#fff" />
            {qrCells.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.2} fill="currentColor" />
            ))}
            <Finder x={0} y={0} />
            <Finder x={QR_SIZE - 7} y={0} />
            <Finder x={0} y={QR_SIZE - 7} />
          </svg>
          <div className="mt-3 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="opacity-50">Amount</span>
              <span className="font-semibold">1.250.000 ₫</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-50">Note</span>
              <span className="font-semibold">DH1234</span>
            </div>
          </div>
          <div className="relative mt-3 h-7 overflow-hidden rounded-full text-center text-[10px] leading-7 font-semibold">
            <div className="absolute inset-0 bg-amber-100 text-amber-800 transition-opacity duration-500 group-hover:opacity-0">
              Waiting for transfer…
            </div>
            <div
              className="absolute inset-0 opacity-0 transition-opacity delay-200 duration-500 group-hover:opacity-100"
              style={{ background: accent, color: "#04140c" }}
            >
              ✓ Paid · order processing
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-[8%] bottom-[14%] hidden rounded-xl border border-white/10 bg-black/70 px-3 py-2 font-mono text-[10px] text-white/80 backdrop-blur md:block">
        <span style={{ color: accent }}>POST</span> /sepay-webhook <span className="text-white/40">200</span>
      </div>
    </div>
  );
}

/* ---------- EMS ---------- */

function EmsVisual({ accent }: { accent: string }) {
  const bars = [38, 62, 45, 80, 56, 92, 70];
  return (
    <div className="relative flex h-full items-center justify-center px-6">
      <div className="w-[82%] overflow-hidden rounded-xl border border-white/10 bg-[#0f1020] shadow-2xl shadow-black/40 transition-transform duration-700 group-hover:-translate-y-1">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="ml-3 h-3 w-40 rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-[64px_1fr] gap-3 p-3">
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-2.5 rounded" style={{ background: i === 1 ? accent : "rgb(255 255 255 / 0.08)" }} />
            ))}
          </div>
          <div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {["Events", "Guests", "Check-in"].map((k, i) => (
                <div key={k} className="rounded-lg bg-white/5 p-2">
                  <div className="text-[8px] text-white/40 uppercase">{k}</div>
                  <div className="mt-1 h-2.5 rounded" style={{ width: `${50 + i * 15}%`, background: "rgb(255 255 255 / 0.25)" }} />
                </div>
              ))}
            </div>
            <div className="flex h-20 items-end gap-1.5 rounded-lg bg-white/5 p-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 origin-bottom rounded-sm transition-transform duration-700 group-hover:scale-y-110"
                  style={{ height: `${h}%`, background: i === 5 ? accent : "rgb(255 255 255 / 0.15)", transitionDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-[6%] bottom-[10%] w-[24%] max-w-[120px] min-w-[86px] rotate-[6deg] rounded-[18px] border border-white/10 bg-[#0b0b14] p-1.5 shadow-2xl shadow-black/50 transition-transform duration-700 group-hover:rotate-0">
        <div className="space-y-1.5 rounded-[13px] bg-[#15162b] p-2">
          <div className="mx-auto mb-2 h-1 w-6 rounded-full bg-white/20" />
          <div className="aspect-square rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}, #c084fc)` }} />
          {[70, 50, 85].map((w) => (
            <div key={w} className="h-1.5 rounded bg-white/15" style={{ width: `${w}%` }} />
          ))}
          <div className="mt-2 h-4 rounded-md" style={{ background: accent }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- WooCommerce ---------- */

function WooVisual({ accent }: { accent: string }) {
  const items = [
    { name: "DDR5 32GB", price: "€109,90" },
    { name: "Arbeitsjacke", price: "€64,50" },
    { name: "NVMe 2TB", price: "€139,00" },
  ];
  return (
    <div className="relative flex h-full flex-col justify-center px-[8%]">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-white/15" />
        <div className="relative grid size-8 place-items-center rounded-full bg-white/10 text-white/70">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
          </svg>
          <span
            className="absolute -top-1 -right-1 grid size-4 scale-0 place-items-center rounded-full text-[9px] font-bold text-black transition-transform duration-300 group-hover:scale-100"
            style={{ background: accent }}
          >
            1
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((it, i) => (
          <div
            key={it.name}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition-transform duration-500 group-hover:-translate-y-1.5"
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <div className="mb-2 aspect-[4/3] rounded-lg bg-gradient-to-br from-white/15 to-white/[0.03]" />
            <div className="text-[10px] font-medium text-white/80">{it.name}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[10px]" style={{ color: accent }}>
                {it.price}
              </span>
              <span className="rounded bg-white/10 px-1 text-[8px] text-white/50">B2B</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {["Größe", "Material", "Norm EN ISO"].map((f) => (
          <span key={f} className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-white/50">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}


/* ---------- Phjn Coffee ---------- */

/** A table card with its QR code, the phone menu it opens, and an order landing on the admin board. */
function CoffeeVisual({ accent }: { accent: string }) {
  const drinks = [
    { name: "Cà phê sữa đá", price: "29.000đ", fill: "#6b4428" },
    { name: "Bạc xỉu", price: "32.000đ", fill: "#a8774d" },
    { name: "Trà đào cam sả", price: "39.000đ", fill: "#e8a25a" },
  ];
  return (
    <div className="relative flex h-full items-center justify-center gap-[5%] px-6">
      {/* Table card */}
      <div className="hidden w-[20%] max-w-[150px] -rotate-6 rounded-2xl bg-[#f4eee4] p-3 text-center text-[#1f2a44] shadow-2xl shadow-black/40 transition-transform duration-700 group-hover:rotate-0 sm:block">
        <div className="text-[9px] font-bold tracking-widest uppercase opacity-60">Phjn Coffee</div>
        <div className="mt-1 text-xl font-extrabold">Bàn 05</div>
        <div className="mx-auto mt-2 grid aspect-square w-4/5 grid-cols-5 gap-0.5 rounded-md bg-white p-1.5">
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} className={`rounded-[1px] ${[0, 1, 4, 5, 7, 9, 12, 13, 15, 19, 20, 21, 23, 24].includes(i) ? "bg-[#1f2a44]" : ""}`} />
          ))}
        </div>
        <div className="mt-2 text-[9px] font-semibold opacity-60">Quét để gọi món</div>
      </div>

      {/* Phone menu */}
      <div className="w-[30%] max-w-[190px] min-w-[150px] rounded-[26px] border border-white/10 bg-[#111] p-1.5 shadow-2xl shadow-black/50">
        <div className="space-y-2 rounded-[20px] bg-[#f4eee4] p-3 text-[#1f2a44]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold">Phjn Coffee</span>
            <span className="rounded-full bg-[#1f2a44] px-1.5 py-0.5 text-[8px] font-bold text-[#f4eee4]">Bàn 05</span>
          </div>
          {drinks.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-2 rounded-xl bg-white/80 p-1.5 transition-transform duration-500 group-hover:-translate-y-0.5"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="grid h-9 w-8 place-items-end rounded-t-full rounded-b-md bg-[#e8e0d2] p-1">
                <span className="h-5 w-full rounded-sm" style={{ background: d.fill }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[9px] font-bold">{d.name}</span>
                <span className="block text-[9px] font-bold" style={{ color: accent }}>
                  {d.price}
                </span>
              </span>
              <span className="grid size-5 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: accent }}>
                +
              </span>
            </div>
          ))}
          <div className="rounded-full bg-[#1f2a44] py-1.5 text-center text-[9px] font-bold text-[#f4eee4]">Đặt món · 3</div>
        </div>
      </div>

      {/* Admin order board */}
      <div className="hidden w-[28%] max-w-[200px] rounded-xl border border-white/10 bg-[#141a2b] p-3 shadow-2xl shadow-black/40 md:block">
        <div className="mb-2 text-[9px] font-bold tracking-widest text-white/50 uppercase">Đơn hàng</div>
        {[
          ["Mới", "Bàn 05", true],
          ["Đang pha", "Bàn 02", false],
          ["Sẵn sàng", "Bàn 11", false],
        ].map(([status, table, fresh]) => (
          <div
            key={String(table)}
            className={`mb-1.5 flex items-center justify-between rounded-lg px-2 py-1.5 text-[9px] font-semibold ${
              fresh ? "text-[#141a2b]" : "bg-white/5 text-white/70"
            }`}
            style={fresh ? { background: accent } : undefined}
          >
            <span>{table}</span>
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
