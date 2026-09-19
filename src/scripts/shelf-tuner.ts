/**
 * TEMPORARY — shelf tuning panel (reels + hero 3D pose).
 *
 * This file exists to be deleted. It is imported by CassetteShelf.astro so it
 * only ever loads on the six shelf pages, it injects its own styles and markup,
 * and it persists nothing in the repo: values live in
 * `localStorage["rrsuika-shelf-tune-v1"]` for this browser only.
 *
 * Two groups, each with its own COPY button:
 *   · REELS     writes `--reel-*` / `--hub-*` custom properties on <html>
 *   · HERO 3D   writes numbers into `window.__shelfTune`, which the pose
 *               function reads through its `TUNE()` accessor
 *
 * When the numbers come back, they get baked into the CSS token block and the
 * pose constants, and this file plus its import are removed.
 */

const KEY = "rrsuika-shelf-tune-v1";

type Slider = {
  group: "reels" | "hero";
  /** CSS custom property (reels) or `__shelfTune` key (hero). */
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Shipped value, and the fallback for RESET. */
  value: number;
  /** Optional display transform, e.g. radians → degrees. */
  unit?: "deg" | "em" | "pct" | "";
};

const SLIDERS: Slider[] = [
  // ── the two hubs ──
  // Defaults are the BAKED values (2026-09-19), so RESET returns to what ships.
  { group: "reels", name: "--reel-size", label: "well size", min: 1.6, max: 3.6, step: 0.01, value: 3.1, unit: "em" },
  // ⚠️ `--reel-hub-inset` is GONE: one inset can only ever describe a circle.
  // Width and height are separate so the bore can be fitted in both axes.
  { group: "reels", name: "--reel-hub-w", label: "hub width", min: 8, max: 52, step: 0.5, value: 32, unit: "pct" },
  { group: "reels", name: "--reel-hub-h", label: "hub height", min: 8, max: 52, step: 0.5, value: 32, unit: "pct" },
  { group: "reels", name: "--reel-hub-alpha", label: "hub opacity", min: 0, max: 1, step: 0.01, value: 0.97 },
  { group: "reels", name: "--reel-hub-gloss", label: "hub gloss", min: 0, max: 1, step: 0.01, value: 0 },
  { group: "reels", name: "--reel-hub-grain", label: "hub grain", min: 0, max: 1, step: 0.01, value: 0 },
  { group: "reels", name: "--reel-cavity", label: "cavity fill", min: 0, max: 1, step: 0.01, value: 0.02 },
  { group: "reels", name: "--reel-occl", label: "well occlusion", min: 0, max: 0.9, step: 0.01, value: 0.44 },
  { group: "reels", name: "--reel-near-shadow", label: "well near", min: 0, max: 1, step: 0.01, value: 0.81 },
  { group: "reels", name: "--reel-far-light", label: "well far", min: 0, max: 0.8, step: 0.01, value: 0.4 },
  { group: "reels", name: "--reel-rim", label: "well rim", min: 0, max: 0.6, step: 0.01, value: 0.21 },
  { group: "reels", name: "--reel-spoke-inset", label: "spoke inset", min: 2, max: 30, step: 0.5, value: 25, unit: "pct" },
  { group: "reels", name: "--reel-spoke-alpha", label: "spoke alpha", min: 0, max: 0.9, step: 0.01, value: 0.25 },
  { group: "reels", name: "--reel-spoke-on", label: "spoke width", min: 1, max: 14, step: 0.5, value: 7, unit: "deg" },
  { group: "reels", name: "--reel-spoke-gap", label: "spoke pitch", min: 16, max: 120, step: 1, value: 120, unit: "deg" },
  // ── the selected tape ──
  // Defaults are the BAKED pose (2026-09-19), so RESET returns to what ships.
  { group: "hero", name: "ryCenter", label: "yaw", min: -0.5, max: 0.6, step: 0.002, value: 0.222, unit: "deg" },
  { group: "hero", name: "rxBase", label: "row pitch", min: -0.45, max: 0.25, step: 0.002, value: -0.13, unit: "deg" },
  { group: "hero", name: "rxHero", label: "hero pitch (bottom/top)", min: -0.4, max: 0.4, step: 0.002, value: 0, unit: "deg" },
  { group: "hero", name: "rzBase", label: "roll", min: -0.25, max: 0.25, step: 0.002, value: 0.074, unit: "deg" },
  { group: "hero", name: "lift", label: "lift", min: 0, max: 1.4, step: 0.01, value: 0.21 },
  { group: "hero", name: "yBase", label: "row height", min: -0.8, max: 0.6, step: 0.01, value: -0.18 },
  { group: "hero", name: "zNear", label: "pull forward", min: 0.2, max: 3.6, step: 0.02, value: 2.6 },
];

const state: Record<string, number> = Object.fromEntries(SLIDERS.map((s) => [s.name, s.value]));

function load(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Record<string, number>;
    for (const s of SLIDERS) if (typeof saved[s.name] === "number") state[s.name] = saved[s.name];
  } catch {
    /* unreadable: keep the shipped values */
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode: the tune just will not survive a reload */
  }
}

const cssValue = (s: Slider, v: number): string => {
  if (s.unit === "pct") return `${v}%`;
  if (s.unit === "deg") return `${v}deg`;
  if (s.unit === "em") return `${v}em`;
  return String(Number(v.toFixed(4)));
};

/**
 * A dark grey as a CSS colour, from a 0–1 lightness slider.
 *
 * ⚠️ The well's fill and its occlusion band are COLOURS, not numbers, and the
 * rest of this panel is number-slider plumbing. Rather than grow a second
 * control type for two knobs, they are driven as a grey level: `--reel-cavity:
 * 0.02` in the shipped CSS means "2% grey", and every useful value for a bore
 * inside a cassette is a dark one. Keep the tint neutral — the theme override
 * in the component is where the warm and cool versions live.
 */
const greyValue = (v: number): string => {
  const c = Math.round(Math.min(1, Math.max(0, v)) * 255);
  return `rgb(${c} ${c} ${c})`;
};

/** Push the whole state at the page. */
function apply(): void {
  const root = document.documentElement;
  const hero: Record<string, number> = {};
  for (const s of SLIDERS) {
    if (s.group === "reels") {
      root.style.setProperty(
        s.name,
        s.name === "--reel-occl"
          ? `rgba(0, 0, 0, ${state[s.name]})`
          : s.name === "--reel-cavity"
            ? greyValue(state[s.name])
            : cssValue(s, state[s.name]),
      );
    } else hero[s.name] = state[s.name];
  }
  (window as typeof window & { __shelfTune?: Record<string, number> }).__shelfTune = hero;
}

function report(group: Slider["group"]): string {
  const rows = SLIDERS.filter((s) => s.group === group);
  const lines = rows.map((s) => {
    const v = state[s.name];
    if (s.group === "hero" && s.unit === "deg") {
      return `${s.name}: ${v.toFixed(4)}   // ${((v * 180) / Math.PI).toFixed(2)}°`;
    }
    if (s.name === "--reel-occl") return `${s.name}: rgba(0, 0, 0, ${v})   // ${s.label}`;
    if (s.name === "--reel-cavity") return `${s.name}: ${greyValue(v)}   // ${s.label}`;
    return `${s.name}: ${cssValue(s, v)}   // ${s.label}`;
  });
  return `${group === "reels" ? "REELS" : "HERO 3D"}\n${lines.join("\n")}`;
}

const STYLE = `
.tune-chip {
  position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%);
  z-index: 2147483100; pointer-events: auto;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--text-bright);
  background: rgba(10, 10, 14, 0.82); border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 2px; padding: 6px 12px; cursor: pointer;
}
.tune-chip:hover { border-color: var(--accent); color: var(--accent); }
.tune-panel {
  position: fixed; right: 18px; top: 96px; width: 268px; max-height: 78vh; overflow-y: auto;
  z-index: 2147483101; pointer-events: auto;
  font-family: var(--font-mono); font-size: 10px; color: #e7e2d8;
  background: rgba(8, 8, 12, 0.92); border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 3px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
}
.tune-panel[hidden] { display: none; }
.tune-head {
  position: sticky; top: 0; z-index: 2; cursor: grab;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 10px; background: rgba(14, 14, 20, 0.96);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  letter-spacing: 0.24em; text-transform: uppercase;
}
.tune-head b { font-weight: 700; color: var(--accent, #e8943a); }
.tune-x { cursor: pointer; color: #9a9a9a; }
.tune-x:hover { color: #ffffff; }
.tune-group { padding: 9px 10px 4px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.tune-group h4 { margin: 0 0 7px; font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(231, 226, 216, 0.6); }
.tune-row { display: grid; grid-template-columns: 1fr auto; gap: 2px 6px; margin-bottom: 6px; }
.tune-row label { color: rgba(231, 226, 216, 0.78); }
.tune-row output { color: var(--accent, #e8943a); font-variant-numeric: tabular-nums; }
.tune-row input[type="range"] { grid-column: 1 / -1; width: 100%; margin: 0; accent-color: var(--accent, #e8943a); }
.tune-actions { display: flex; gap: 6px; padding: 9px 10px 11px; }
.tune-actions button {
  flex: 1; font-family: inherit; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: #e7e2d8; background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 2px; padding: 6px 4px; cursor: pointer;
}
.tune-actions button:hover { border-color: var(--accent, #e8943a); color: var(--accent, #e8943a); }
.tune-actions button.is-done { color: #7fd07f; border-color: #7fd07f; }
`;

export function initShelfTuner(): void {
  load();
  apply();

  const style = document.createElement("style");
  style.id = "shelf-tuner-style";
  style.textContent = STYLE;
  document.head.appendChild(style);

  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "tune-chip";
  chip.textContent = "tune reels + 3D";

  const panel = document.createElement("div");
  panel.className = "tune-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Shelf tuner");

  const head = document.createElement("div");
  head.className = "tune-head";
  head.innerHTML = `<span><b>SHELF TUNE</b></span>`;
  const close = document.createElement("span");
  close.className = "tune-x";
  close.textContent = "✕";
  close.addEventListener("click", () => {
    panel.hidden = true;
  });
  head.appendChild(close);
  panel.appendChild(head);

  const outputs = new Map<string, HTMLOutputElement>();

  for (const group of ["reels", "hero"] as const) {
    const box = document.createElement("div");
    box.className = "tune-group";
    const title = document.createElement("h4");
    title.textContent = group === "reels" ? "REELS — both hubs" : "HERO — selected tape";
    box.appendChild(title);

    for (const s of SLIDERS.filter((x) => x.group === group)) {
      const row = document.createElement("div");
      row.className = "tune-row";
      const label = document.createElement("label");
      label.textContent = s.label;
      const out = document.createElement("output");
      outputs.set(s.name, out);
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(s.min);
      input.max = String(s.max);
      input.step = String(s.step);
      input.value = String(state[s.name]);
      input.addEventListener("input", () => {
        state[s.name] = Number(input.value);
        apply();
        save();
        render();
      });
      row.append(label, out, input);
      box.appendChild(row);
    }

    const actions = document.createElement("div");
    actions.className = "tune-actions";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "copy";
    copy.addEventListener("click", () => {
      const text = report(group);
      copy.textContent = "copied";
      copy.classList.add("is-done");
      window.setTimeout(() => {
        copy.textContent = "copy";
        copy.classList.remove("is-done");
      }, 1200);
      navigator.clipboard?.writeText(text).catch(() => {
        // Clipboard blocked: fall back to a selectable prompt.
        window.prompt("Copy these values:", text);
      });
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "reset";
    reset.addEventListener("click", () => {
      for (const s of SLIDERS.filter((x) => x.group === group)) state[s.name] = s.value;
      apply();
      save();
      syncInputs();
      render();
    });
    actions.append(copy, reset);
    box.appendChild(actions);
    panel.appendChild(box);
  }

  const inputs = new Map<string, HTMLInputElement>();
  panel.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((el) => {
    const row = el.closest(".tune-row");
    const name = SLIDERS.find((s) => s.label === row?.querySelector("label")?.textContent)?.name;
    if (name) inputs.set(name, el);
  });

  function syncInputs(): void {
    for (const [name, el] of inputs) el.value = String(state[name]);
  }

  function render(): void {
    for (const s of SLIDERS) {
      const out = outputs.get(s.name);
      if (!out) continue;
      const v = state[s.name];
      out.textContent =
        s.unit === "deg" && s.group === "hero"
          ? `${((v * 180) / Math.PI).toFixed(1)}°`
          : s.unit === "deg"
            ? `${v}°`
            : s.unit === "pct"
              ? `${v}%`
              : s.unit === "em"
                ? `${v}em`
                : v.toFixed(2);
    }
  }

  chip.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  // Dragging the header, clamped to the viewport.
  let drag: { x: number; y: number; left: number; top: number } | null = null;
  head.addEventListener("pointerdown", (event) => {
    if ((event.target as Element).classList.contains("tune-x")) return;
    const rect = panel.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    panel.style.right = "auto";
    head.setPointerCapture(event.pointerId);
  });
  head.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const left = Math.min(Math.max(0, drag.left + event.clientX - drag.x), window.innerWidth - panel.offsetWidth);
    const top = Math.min(Math.max(0, drag.top + event.clientY - drag.y), window.innerHeight - 40);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  });
  head.addEventListener("pointerup", () => {
    drag = null;
  });

  // The backtick opens and closes it, like the lens tuner.
  window.addEventListener("keydown", (event) => {
    if (event.key === "`" && !(event.target as Element)?.matches("input, textarea")) {
      panel.hidden = !panel.hidden;
    }
  });

  document.body.append(chip, panel);
  syncInputs();
  render();
}
