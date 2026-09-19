/**
 * TEMPORARY-BUT-KEPT — per-letter positioning panel for the hero title.
 *
 * The hero headline is a condensed 900 display face, and its pair advances are
 * uneven (FU tight, CT loose). At `--text-scale-hero` those differences are metres
 * wide on screen, so one `letter-spacing` cannot even them out — every letter needs
 * its own nudge. This panel nudges one glyph at a time and prints the offsets as a
 * pasteable CSS block.
 *
 * 2026-09-19: the panel and its measuring grid were deleted once the first numbers
 * were baked in, then asked for again — "以后就隐藏起来，不删除了，我觉得有他还很方便" —
 * so the code stays in the repo, switched off by `TUNER_ENABLED` instead. `false`
 * hides the whole tool (chip, panel, grid, crosshair, coord readout) with a single
 * early return and leaves every line of it in place.
 *
 * Baking loop: tune → COPY → paste into the baked `.ltr[data-line][data-i]` block in
 * `Hero.astro` → set `TUNER_ENABLED = false`. The panel seeds itself FROM that baked
 * block (see `baked` in `build()`), so a fresh browser shows the shipped offsets
 * rather than zero, and RESET returns to the shipped offsets.
 *
 * Values live in `localStorage["rrsuika-hero-letters-v1"]` for this browser only —
 * never in the repo — and are applied as inline `--lx`/`--ly` custom properties on
 * the letter spans, which the `.ltr` rule turns into a translate.
 */

/** Flip to `true` to bring the panel + measuring grid back.
    2026-09-19: off again after the second tuning pass was baked into `Hero.astro`
    (line 1 `C` −2.5; line 2 `H` 7.75, `T` 8.5, `C` 8.5). */
const TUNER_ENABLED = false;

const KEY = "rrsuika-hero-letters-v1";
const GRID_KEY = "rrsuika-hero-grid-v1";
const RANGE = 30; // px, each way
/** 0.25, not 0.5: the 2026-09-19 second pass landed on `H = 7.75` — a value a
    0.5 step physically cannot express ("我每次调整数值只能在 0.5 之间变化，无法更精细的
    调整"), so the target had to be typed in by hand. 0.25 makes that reachable. */
const STEP = 0.25;

interface Letter {
  el: HTMLElement;
  line: string;
  index: string;
  ch: string;
  /** The baked (shipped) offset, read from the stylesheet at startup. */
  baked: Offset;
}

interface Offset {
  x: number;
  y: number;
}

/**
 * The measuring grid, as four numbers instead of the six hard-coded pitches it
 * used to be. Everything else is derived (2026-09-19: "添加变量，调整网格的密度，
 * 格子的宽度，格子的大小，间距"):
 *
 *   cell   the box the grid is drawn for      — `cellW` × `cellH`
 *   gap    space between two boxes            — pitch = cell + gap
 *   density how many fine lines cut a cell    — fine pitch = pitch / density
 *   coarse five cells                         — a coarse pitch = pitch × 5
 *
 * ⚠️ The defaults are the values the current hero offsets were tuned against —
 * `density 11 · cell 46x34.5 · gap 0 → pitch 46x34.5, fine 4.18x3.14, coarse
 * 230x172.5`, the same line recorded in `Hero.astro`. RESET comes back here.
 */
interface GridState {
  density: number;
  cellW: number;
  cellH: number;
  gap: number;
}

const GRID_DEFAULTS: GridState = { density: 11, cellW: 46, cellH: 34.5, gap: 0 };
let grid: GridState = { ...GRID_DEFAULTS };

const offsets = new Map<string, Offset>();
let letters: Letter[] = [];
/** The `.ht-grid` element, kept module-level so `applyGrid()` (called from a
    slider) does not have to find it again. */
let gridEl: HTMLElement | null = null;

const keyOf = (l: Letter) => `${l.line}:${l.index}`;

/** The value a slider, a readout and COPY should show: the browser-local override
    if there is one, otherwise the offset baked into the stylesheet. */
const effective = (l: Letter): Offset => offsets.get(keyOf(l)) ?? l.baked;

function load(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Record<string, Offset>;
    for (const [k, v] of Object.entries(saved)) {
      if (typeof v?.x === "number" && typeof v?.y === "number") offsets.set(k, v);
    }
  } catch {
    /* unreadable: fall back to the baked offsets */
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(offsets)));
  } catch {
    /* private mode: the tune just will not survive a reload */
  }
}

/** ⚠️ `density` is a slider: it can be 1, and it can arrive as a float from an
    older payload. Both of those put a pitch of 0 (or worse, a NaN) into a
    `repeating-linear-gradient`, which makes the browser drop the whole layer —
    the grid would silently lose a tier instead of looking wrong. */
function sanitise(raw: Partial<GridState> | null | undefined): GridState {
  const num = (v: unknown, fallback: number, min: number, max: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  return {
    density: Math.round(num(raw?.density, GRID_DEFAULTS.density, 1, 16)),
    cellW: num(raw?.cellW, GRID_DEFAULTS.cellW, 2, 240),
    cellH: num(raw?.cellH, GRID_DEFAULTS.cellH, 2, 240),
    gap: num(raw?.gap, GRID_DEFAULTS.gap, 0, 48),
  };
}

function loadGrid(): void {
  try {
    const raw = localStorage.getItem(GRID_KEY);
    grid = raw ? sanitise(JSON.parse(raw) as Partial<GridState>) : { ...GRID_DEFAULTS };
  } catch {
    grid = { ...GRID_DEFAULTS };
  }
}

function saveGrid(): void {
  try {
    localStorage.setItem(GRID_KEY, JSON.stringify(grid));
  } catch {
    /* private mode */
  }
}

/** Write the six derived pitches onto the grid element. Called on every slider
    move — six custom properties on one element is cheaper than rebuilding the
    panel, and the layers repaint on the next frame. */
function applyGrid(): void {
  const el = gridEl;
  if (!el) return;
  const px = (n: number) => `${Math.max(0.5, Math.round(n * 100) / 100)}px`;
  const mx = grid.cellW + grid.gap;
  const my = grid.cellH + grid.gap;
  el.style.setProperty("--ht-fine-x", px(mx / grid.density));
  el.style.setProperty("--ht-fine-y", px(my / grid.density));
  el.style.setProperty("--ht-mid-x", px(mx));
  el.style.setProperty("--ht-mid-y", px(my));
  el.style.setProperty("--ht-coarse-x", px(mx * 5));
  el.style.setProperty("--ht-coarse-y", px(my * 5));
}

function applyLetter(l: Letter): void {
  const o = offsets.get(keyOf(l));
  if (!o) {
    /* No override for this glyph: hand it back to the baked stylesheet rule.
       ⚠️ Do NOT write 0 here — an inline `--lx: 0px` beats the baked rule and
       would silently wipe the shipped offsets on any browser with no saved tune. */
    l.el.style.removeProperty("--lx");
    l.el.style.removeProperty("--ly");
    return;
  }
  l.el.style.setProperty("--lx", `${o.x}px`);
  l.el.style.setProperty("--ly", `${o.y}px`);
}

function applyAll(): void {
  for (const l of letters) applyLetter(l);
}

/** The pasteable output: the grid settings, then one rule per letter in source
    order. Reports the *effective* offsets (baked where nothing is overridden), so
    an untouched letter still prints its shipped value instead of 0. The grid block
    is a report, not something the site imports — the measuring grid is a tool and
    never ships. */
function report(): string {
  const rows = letters.map((l) => {
    const o = effective(l);
    return `.ltr[data-line="${l.line}"][data-i="${l.index}"] { --lx: ${o.x}px; --ly: ${o.y}px } /* ${l.ch} */`;
  });
  const line1 = letters.filter((l) => l.line === "1").map((l) => l.ch).join("");
  const line2 = letters.filter((l) => l.line === "2").map((l) => l.ch).join("");
  const mx = grid.cellW + grid.gap;
  const my = grid.cellH + grid.gap;
  const gridLine =
    `/* grid: density ${grid.density} · cell ${grid.cellW}x${grid.cellH} · gap ${grid.gap}` +
    ` → pitch ${mx}x${my}, fine ${(mx / grid.density).toFixed(2)}x${(my / grid.density).toFixed(2)},` +
    ` coarse ${mx * 5}x${my * 5} */`;
  return `${gridLine}\n/* hero letter offsets — ${line1} / ${line2} */\n${rows.join("\n")}`;
}

const STYLE = `
/* ── The measuring grid ──
   Three tiers derived from four numbers (see applyGrid): a fine grid at
   cell/density, the cell grid itself, and a coarse one at 5 cells. It is drawn in
   the accent colour so it reads on BOTH themes (a white-only grid vanishes on the
   light one). It is pointer-events: none and sits UNDER the panel (lower z-index),
   and it only exists while the panel is open — this is a measuring tool, not a
   design element (2026-09-19: "点开 HERO LETTERS 面板时同时出现一个非常密的网格，方便我
   观察距离和定位").
   ⚠️ The defaults here are the tuned grid (11 / 46x34.5 / 0), matching
   GRID_DEFAULTS; they only matter for the split second before the first applyGrid,
   because JS writes the live values inline on this element, where they win. */
.ht-grid {
  --ht-fine-x: 4.18px; --ht-fine-y: 3.14px;
  --ht-mid-x: 46px; --ht-mid-y: 34.5px;
  --ht-coarse-x: 230px; --ht-coarse-y: 172.5px;
  position: fixed; inset: 0; pointer-events: none; z-index: 2147483090;
  background-image:
    repeating-linear-gradient(90deg, rgba(232,148,58,0.18) 0 1px, transparent 1px var(--ht-fine-x)),
    repeating-linear-gradient(0deg,  rgba(232,148,58,0.18) 0 1px, transparent 1px var(--ht-fine-y)),
    repeating-linear-gradient(90deg, rgba(232,148,58,0.38) 0 1px, transparent 1px var(--ht-mid-x)),
    repeating-linear-gradient(0deg,  rgba(232,148,58,0.38) 0 1px, transparent 1px var(--ht-mid-y)),
    repeating-linear-gradient(90deg, rgba(232,148,58,0.85) 0 1px, transparent 1px var(--ht-coarse-x)),
    repeating-linear-gradient(0deg,  rgba(232,148,58,0.85) 0 1px, transparent 1px var(--ht-coarse-y));
}
.ht-grid[hidden] { display: none; }
/* A crosshair on the hero's own origin: the h1's left edge and its baseline box. */
.ht-axis-x, .ht-axis-y { position: fixed; pointer-events: none; z-index: 2147483091; background: #e8943a; }
.ht-axis-x { left: 0; right: 0; height: 1px; }
.ht-axis-y { top: 0; bottom: 0; width: 1px; }
.ht-axis-x[hidden], .ht-axis-y[hidden] { display: none; }
.ht-coord {
  position: fixed; z-index: 2147483102; pointer-events: none;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em;
  color: #e8943a; background: rgba(8,8,12,0.8); padding: 2px 5px; border-radius: 2px;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.ht-coord[hidden] { display: none; }
.ht-chip {
  position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%);
  z-index: 2147483100; pointer-events: auto;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--text-bright);
  background: rgba(10, 10, 14, 0.82); border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 2px; padding: 6px 12px; cursor: pointer;
}
.ht-chip:hover { border-color: var(--accent); color: var(--accent); }
.ht-panel {
  position: fixed; right: 18px; top: 96px; width: 250px; max-height: 78vh; overflow-y: auto;
  z-index: 2147483101; pointer-events: auto;
  font-family: var(--font-mono); font-size: 10px; color: #e7e2d8;
  background: rgba(8, 8, 12, 0.94); border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 3px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
}
.ht-panel[hidden] { display: none; }
.ht-head {
  position: sticky; top: 0; z-index: 2; cursor: grab;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 10px; background: rgba(14, 14, 20, 0.97);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  letter-spacing: 0.22em; text-transform: uppercase;
}
.ht-head b { font-weight: 700; color: var(--accent, #e8943a); }
.ht-x { cursor: pointer; color: #9a9a9a; }
.ht-x:hover { color: #fff; }
.ht-line { padding: 8px 10px 2px; font-size: 9px; letter-spacing: 0.26em; color: rgba(231,226,216,0.55); border-top: 1px solid rgba(255,255,255,0.08); }
.ht-row { display: grid; grid-template-columns: 18px 1fr 1fr; gap: 4px 6px; align-items: center; padding: 3px 10px; }
/* One grid knob: label / slider / value. Wider label column than a letter row —
   the names are words, not glyphs. */
.ht-grow { display: grid; grid-template-columns: 66px 1fr 38px; gap: 4px 6px; align-items: center; padding: 4px 10px; }
.ht-grow > b { font-weight: 400; color: rgba(231,226,216,0.72); letter-spacing: 0.06em; }
.ht-grow > span { color: var(--accent, #e8943a); text-align: right; font-variant-numeric: tabular-nums; }
.ht-ch { color: var(--accent, #e8943a); font-weight: 700; }
.ht-cell { display: grid; grid-template-columns: 26px 1fr; gap: 4px; align-items: center; }
.ht-cell span { color: rgba(231,226,216,0.55); font-variant-numeric: tabular-nums; }
.ht-row input[type="range"] { width: 100%; margin: 0; accent-color: var(--accent, #e8943a); height: 14px; }
.ht-actions { display: flex; gap: 6px; padding: 10px; position: sticky; bottom: 0; background: rgba(10,10,14,0.96); border-top: 1px solid rgba(255,255,255,0.12); }
.ht-actions button {
  flex: 1; font-family: inherit; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
  color: #e7e2d8; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 2px; padding: 6px 4px; cursor: pointer;
}
.ht-actions button:hover { border-color: var(--accent, #e8943a); color: var(--accent, #e8943a); }
.ht-actions button.is-done { color: #7fd07f; border-color: #7fd07f; }
`;

export function initHeroTuner(): void {
  /* Hidden, not deleted: `TUNER_ENABLED = false` is the whole switch — one early
     return and the page is driven purely by the stylesheet and the baked `.ltr`
     offsets (no chip, no panel, no grid, no listeners). */
  if (!TUNER_ENABLED) return;

  /* ⚠️ The hero's typewriter does `el.innerHTML = ""` on every `.type-line` and
     only puts the original markup back once the last line has been typed — so at
     the moment this runs the letter spans DO NOT EXIST YET. Poll for them rather
     than assuming (measured: 20 spans appear when typing finishes). */
  const start = (tries: number): void => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".hero h1 .ltr"));
    /* ⚠️ Both lines, not just "some letters": the typewriter restores one
       `.type-line` at a time, so line 1's spans come back while line 2 is still
       empty — building on the first batch gave a panel with 10 letters and 20
       sliders instead of 20 and 40. Line 2's spans are the "typing is done" flag. */
    const ready = els.length > 0 && els.some((el) => el.dataset.line === "2");
    if (!ready) {
      if (tries < 60) window.setTimeout(() => start(tries + 1), 250);
      return;
    }
    build(els);
  };
  start(0);
}

function build(els: HTMLElement[]): void {
  /* Read the baked offsets off the stylesheet BEFORE writing anything: the panel's
     zero point is what ships, not 0px, so the sliders open on the shipped values
     and RESET returns to them. */
  letters = els.map((el) => {
    const cs = getComputedStyle(el);
    return {
      el,
      line: el.dataset.line ?? "1",
      index: el.dataset.i ?? "0",
      ch: el.textContent ?? "",
      baked: {
        x: parseFloat(cs.getPropertyValue("--lx")) || 0,
        y: parseFloat(cs.getPropertyValue("--ly")) || 0,
      },
    };
  });

  load();
  applyAll();

  const style = document.createElement("style");
  style.id = "hero-tuner-style";
  style.textContent = STYLE;
  document.head.appendChild(style);

  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "ht-chip";
  chip.textContent = "tune hero letters";

  const panel = document.createElement("div");
  panel.className = "ht-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Hero letter tuner");

  const head = document.createElement("div");
  head.className = "ht-head";
  head.innerHTML = `<span><b>HERO LETTERS</b></span>`;
  const close = document.createElement("span");
  close.className = "ht-x";
  close.textContent = "✕";
  close.addEventListener("click", () => { panel.hidden = true; });
  head.appendChild(close);
  panel.appendChild(head);

  const readouts: Array<() => void> = [];

  for (const line of ["1", "2"]) {
    const row = letters.filter((l) => l.line === line);
    if (!row.length) continue;
    const title = document.createElement("div");
    title.className = "ht-line";
    title.textContent = `LINE ${line} — ${row.map((l) => l.ch).join("")}`;
    panel.appendChild(title);

    for (const l of row) {
      const wrap = document.createElement("div");
      wrap.className = "ht-row";
      const ch = document.createElement("div");
      ch.className = "ht-ch";
      ch.textContent = l.ch;

      const mk = (axis: "x" | "y") => {
        const cell = document.createElement("div");
        cell.className = "ht-cell";
        const out = document.createElement("span");
        const input = document.createElement("input");
        input.type = "range";
        input.min = String(-RANGE);
        input.max = String(RANGE);
        input.step = String(STEP);
        const cur = effective(l);
        input.value = String(cur[axis]);
        out.textContent = `${cur[axis]}`;
        input.addEventListener("input", () => {
          const next = effective(l);
          next[axis] = Number(input.value);
          offsets.set(keyOf(l), next);
          out.textContent = `${next[axis]}`;
          applyLetter(l);
          save();
        });
        cell.append(out, input);
        readouts.push(() => {
          const cur2 = effective(l);
          input.value = String(cur2[axis]);
          out.textContent = `${cur2[axis]}`;
        });
        return cell;
      };

      wrap.append(ch, mk("x"), mk("y"));
      panel.appendChild(wrap);
    }
  }

  /* ── GRID — the measuring grid's four numbers ──
     The grid is drawn from `density`, `cellW`, `cellH` and `gap`; the pitches it
     actually uses are printed under the sliders, because "46 + 0 gap, density 11"
     is the useful half of a measurement and the pixels on screen are not. */
  loadGrid();

  const gridTitle = document.createElement("div");
  gridTitle.className = "ht-line";
  gridTitle.textContent = "GRID";
  panel.appendChild(gridTitle);

  const pitchOut = document.createElement("div");
  pitchOut.className = "ht-line";
  pitchOut.style.borderTop = "none";

  const gridReadouts: Array<() => void> = [];
  const gridKnobs: Array<{
    key: keyof GridState;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }> = [
    { key: "density", label: "密度 DENSITY", min: 1, max: 16, step: 1, unit: "×" },
    { key: "cellW", label: "格子宽 CELL W", min: 2, max: 240, step: 0.5, unit: "px" },
    { key: "cellH", label: "格子高 CELL H", min: 2, max: 240, step: 0.5, unit: "px" },
    { key: "gap", label: "间距 GAP", min: 0, max: 48, step: 0.5, unit: "px" },
  ];

  const syncPitch = (): void => {
    const mx = grid.cellW + grid.gap;
    const my = grid.cellH + grid.gap;
    /* Same numbers as the COPY header, so what the panel reports and what gets
       pasted never disagree. */
    pitchOut.textContent =
      `fine ${(mx / grid.density).toFixed(2)} / ${(my / grid.density).toFixed(2)}` +
      ` · cell ${mx} / ${my}` +
      ` · coarse ${mx * 5} / ${my * 5}`;
  };

  for (const knob of gridKnobs) {
    const row = document.createElement("div");
    row.className = "ht-grow";
    const label = document.createElement("b");
    label.textContent = knob.label;
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(knob.min);
    input.max = String(knob.max);
    input.step = String(knob.step);
    input.value = String(grid[knob.key]);
    const out = document.createElement("span");
    out.textContent = `${grid[knob.key]}${knob.unit}`;
    input.addEventListener("input", () => {
      grid[knob.key] = Number(input.value);
      out.textContent = `${grid[knob.key]}${knob.unit}`;
      applyGrid();
      syncPitch();
      saveGrid();
    });
    row.append(label, input, out);
    panel.appendChild(row);
    gridReadouts.push(() => {
      input.value = String(grid[knob.key]);
      out.textContent = `${grid[knob.key]}${knob.unit}`;
    });
  }
  panel.appendChild(pitchOut);
  // Populate before the first move: an empty readout under four sliders looks
  // like a broken row rather than a value nobody has touched yet.
  syncPitch();

  const actions = document.createElement("div");
  actions.className = "ht-actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "copy";
  copy.addEventListener("click", () => {
    const text = report();
    copy.textContent = "copied";
    copy.classList.add("is-done");
    window.setTimeout(() => { copy.textContent = "copy"; copy.classList.remove("is-done"); }, 1200);
    navigator.clipboard?.writeText(text).catch(() => {
      window.prompt("Copy these values:", text);
    });
  });
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "reset";
  reset.addEventListener("click", () => {
    /* Clearing the overrides hands every glyph back to its baked rule, so RESET
       means "back to what ships" — same convention as the shelf panel. */
    offsets.clear();
    applyAll();
    save();
    for (const r of readouts) r();
    // One reset for the whole tool: a half-reset panel (letters back to shipped,
    // grid still on the values from twenty minutes ago) reads as a bug.
    grid = { ...GRID_DEFAULTS };
    applyGrid();
    syncPitch();
    saveGrid();
    for (const r of gridReadouts) r();
  });
  actions.append(copy, reset);
  panel.appendChild(actions);

  document.body.append(chip, panel);

  /* ── The grid, the crosshair and the pointer readout ──
     All three live and die with the panel. The crosshair is pinned to the hero
     h1's box (its left edge and its vertical centre), so a nudge can be read
     against something real instead of the viewport. */
  gridEl = document.createElement("div");
  gridEl.className = "ht-grid";
  gridEl.hidden = true;
  applyGrid();

  const axisX = document.createElement("div");
  axisX.className = "ht-axis-x";
  axisX.hidden = true;
  const axisY = document.createElement("div");
  axisY.className = "ht-axis-y";
  axisY.hidden = true;
  const coord = document.createElement("div");
  coord.className = "ht-coord";
  coord.hidden = true;
  document.body.append(gridEl, axisX, axisY, coord);

  const showTools = (on: boolean): void => {
    if (gridEl) gridEl.hidden = !on;
    axisX.hidden = !on;
    axisY.hidden = !on;
    coord.hidden = !on;
    if (!on) return;
    const h1 = document.querySelector<HTMLElement>(".hero h1");
    if (h1) {
      const r = h1.getBoundingClientRect();
      axisX.style.top = `${Math.round(r.top + r.height * 0.5)}px`;
      axisY.style.left = `${Math.round(r.left)}px`;
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (coord.hidden) return;
      coord.textContent = `${event.clientX} , ${event.clientY}`;
      coord.style.left = `${event.clientX + 12}px`;
      coord.style.top = `${event.clientY + 12}px`;
    },
    { passive: true },
  );

  const setPanel = (open: boolean): void => {
    panel.hidden = !open;
    showTools(open);
  };

  chip.addEventListener("click", () => setPanel(panel.hidden === true));
  close.addEventListener("click", () => setPanel(false));
  window.addEventListener("keydown", (event) => {
    if (event.key === "`" && !(event.target as Element)?.matches("input, textarea")) {
      setPanel(panel.hidden === true);
    }
  });
  let drag: { x: number; y: number; left: number; top: number } | null = null;
  head.addEventListener("pointerdown", (event) => {
    if ((event.target as Element).classList.contains("ht-x")) return;
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
  head.addEventListener("pointerup", () => { drag = null; });
}
