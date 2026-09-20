/**
 * TEMPORARY — site-intro tuning panel.
 *
 * This file exists to be deleted. It is imported by `src/pages/intro-preview.astro`
 * (a page that exists only for tuning), it injects its own styles and markup, and
 * it persists nothing in the repo: values live in
 * `localStorage["rrsuika-intro-tune-v1"]` for this browser only.
 *
 * It writes the intro's geometry tokens on `<html>`, which is why those defaults
 * are declared on `:root` in global.css §16 rather than on `.site-intro` — a
 * declaration on the element would shadow the inherited override entirely.
 *
 * When the numbers come back they get baked into the `:root` token block and this
 * file, its import and the preview page are removed.
 */

const KEY = "rrsuika-intro-tune-v1";

type Knob = {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** The shipped value — also what RESET returns to. */
  value: number;
  unit: "" | "px" | "pct" | "vh";
};

const KNOBS: Knob[] = [
  // ── the wordmark block ──
  { name: "--intro-mark-top-pct", label: "wordmark 垂直位置 %", min: 5, max: 70, step: 0.5, value: 34, unit: "pct" },
  { name: "--intro-mark-top-vh", label: "wordmark 垂直位置 vh", min: 0, max: 45, step: 0.5, value: 12, unit: "vh" },
  { name: "--intro-font-mark", label: "wordmark 字号 px", min: 30, max: 96, step: 1, value: 58, unit: "" },
  // ── the orange rule under the wordmark ──
  { name: "--intro-rule-nudge", label: "橙色分隔线 上下位移 px", min: -80, max: 80, step: 1, value: 0, unit: "" },
  // ── the readout block ──
  { name: "--intro-readout-bottom", label: "readout 距底 %", min: 0, max: 40, step: 0.5, value: 6, unit: "pct" },
  { name: "--intro-gap", label: "readout 行间距 px", min: 0, max: 60, step: 1, value: 20, unit: "" },
  { name: "--intro-font-pct", label: "百分比字号 px", min: 40, max: 150, step: 1, value: 104, unit: "" },
  { name: "--intro-font-meta", label: "小字字号 px", min: 7, max: 20, step: 0.5, value: 10, unit: "" },
  // ── the bottom rail ──
  { name: "--intro-rail-bottom", label: "底部橙条 距底 px", min: -20, max: 120, step: 1, value: 0, unit: "" },
];

const state: Record<string, number> = Object.fromEntries(KNOBS.map((k) => [k.name, k.value]));

function load(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Record<string, number>;
    for (const k of KNOBS) if (typeof saved[k.name] === "number") state[k.name] = saved[k.name];
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

/** Push the whole state at the page. A bare number is what the CSS calc expects. */
function apply(): void {
  const root = document.documentElement;
  for (const k of KNOBS) root.style.setProperty(k.name, String(state[k.name]));
}

/** The block the user pastes back. */
function report(): string {
  const lines = KNOBS.map((k) => {
    const v = state[k.name];
    const suffix = k.unit === "pct" ? "  /* % */" : k.unit === "vh" ? "  /* vh */" : "";
    return `${k.name}: ${v};${suffix}   // ${k.label}`;
  });
  return ["SITE INTRO TUNABLE VALUES", ...lines].join("\n");
}

const STYLE = `
.tune-chip {
  position: fixed; right: 18px; bottom: 14px;
  z-index: 2147483600; pointer-events: auto;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.22em;
  text-transform: uppercase; color: #f2ece0;
  background: rgba(10, 10, 14, 0.86); border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 2px; padding: 6px 12px; cursor: pointer;
}
.tune-chip:hover { border-color: var(--accent); color: var(--accent); }
.tune-panel {
  position: fixed; right: 18px; bottom: 52px; width: 300px; max-height: 78vh; overflow-y: auto;
  z-index: 2147483601; pointer-events: auto;
  font-family: var(--font-mono); font-size: 10px; color: #e7e2d8;
  background: rgba(8, 8, 12, 0.94); border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 3px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
}
.tune-panel[hidden] { display: none; }
.tune-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  letter-spacing: 0.18em; text-transform: uppercase;
}
.tune-head b { color: var(--accent, #e8943a); font-weight: 700; }
.tune-row { padding: 6px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
.tune-row label { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.tune-row span { color: #f2ece0; font-variant-numeric: tabular-nums; }
.tune-row input { width: 100%; }
.tune-foot { display: flex; gap: 6px; padding: 8px 10px; }
.tune-foot button {
  flex: 1; cursor: pointer; font-family: inherit; font-size: 9px; letter-spacing: 0.16em;
  text-transform: uppercase; color: #f2ece0; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 2px; padding: 6px 4px;
}
.tune-foot button:hover { border-color: var(--accent); color: var(--accent); }
.tune-note { padding: 0 10px 10px; color: #9a9a9a; line-height: 1.5; }
`;

function build(): void {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.appendChild(style);

  const chip = document.createElement("button");
  chip.className = "tune-chip";
  chip.textContent = "INTRO TUNE";

  const panel = document.createElement("div");
  panel.className = "tune-panel";
  panel.hidden = true;

  const head = document.createElement("div");
  head.className = "tune-head";
  head.innerHTML = "<b>INTRO</b><span>tune</span>";
  panel.appendChild(head);

  const rows: { knob: Knob; input: HTMLInputElement; readout: HTMLElement }[] = [];

  for (const k of KNOBS) {
    const row = document.createElement("div");
    row.className = "tune-row";
    const lab = document.createElement("label");
    const name = document.createElement("span");
    name.textContent = k.label;
    const val = document.createElement("span");
    val.textContent = String(state[k.name]);
    lab.append(name, val);
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(k.min);
    input.max = String(k.max);
    input.step = String(k.step);
    input.value = String(state[k.name]);
    input.addEventListener("input", () => {
      state[k.name] = Number(input.value);
      val.textContent = input.value;
      apply();
      save();
    });
    row.append(lab, input);
    panel.appendChild(row);
    rows.push({ knob: k, input, readout: val });
  }

  const foot = document.createElement("div");
  foot.className = "tune-foot";

  const btnCopy = document.createElement("button");
  btnCopy.textContent = "COPY 参数";
  btnCopy.addEventListener("click", async () => {
    const text = report();
    try {
      await navigator.clipboard.writeText(text);
      btnCopy.textContent = "已复制 ✓";
    } catch {
      // clipboard needs a secure context / permission; fall back to a prompt
      window.prompt("复制这些值：", text);
      btnCopy.textContent = "已显示 ✓";
    }
    window.setTimeout(() => (btnCopy.textContent = "COPY 参数"), 1600);
  });

  const btnReset = document.createElement("button");
  btnReset.textContent = "RESET";
  btnReset.addEventListener("click", () => {
    for (const { knob, input, readout } of rows) {
      state[knob.name] = knob.value;
      input.value = String(knob.value);
      readout.textContent = String(knob.value);
    }
    apply();
    save();
  });

  const btnLog = document.createElement("button");
  btnLog.textContent = "打日志";
  btnLog.addEventListener("click", () => {
    // eslint-disable-next-line no-console
    console.log(report());
    btnLog.textContent = "见控制台 ✓";
    window.setTimeout(() => (btnLog.textContent = "打日志"), 1600);
  });

  foot.append(btnCopy, btnReset, btnLog);
  panel.appendChild(foot);

  const note = document.createElement("div");
  note.className = "tune-note";
  note.textContent = "拖动即时生效并记住。调好后按 COPY 参数 贴给我。";
  panel.appendChild(note);

  chip.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  document.body.append(chip, panel);
}

load();
apply();
build();

export {};