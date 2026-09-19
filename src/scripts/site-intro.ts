/**
 * Site intro / preloader — the visual half.
 *
 * A machine boots: a gridded plate, a wordmark, a three-digit counter with a
 * status line that steps through what it is actually waiting for, three corner
 * labels, and one striped rail along the bottom edge that fills as the count
 * climbs. It lifts when the page can draw — the black-hole video has a frame,
 * the fonts are in, `window.load` has fired — and it lifts by throwing the
 * signal colour up the screen and dissolving it into the page.
 *
 * ⚠️ **Whether it plays at all is decided in <head>, not here.** The inline
 * guard in `Layout.astro` runs before the first paint and tags the document
 * either `is-intro` or `is-intro-skip`; a module script runs after the body is
 * parsed, which is late enough that a link navigation would show the cover for a
 * few hundred ms and then snatch it away. Everything below only assumes
 * `is-intro` was set, and the guard's own safety net will still open the cover
 * if this file never runs.
 *
 * ⚠️ Nothing here may be able to trap the page: the readiness waits, the minimum
 * display time and the exit all resolve against the guard's 6 s cap, and the
 * gate the shelf waits on is resolved by the guard too.
 */

/**
 * The nominal 0 → 100 count.
 *
 * ⚠️ **The counter RUNS to 100, and it gets there fast** ("我希望开场动画至少有快速
 * 是 0-100 的切换"). The shape is the reference's own:
 * `max(t, easeOutCubic(t) · 0.85)` — an eased head that is already at ~50% in
 * the first quarter, handing over to a linear tail that lands on exactly 100.
 * Measured on this curve: 49% at 0.55 s, 74% at 1.1 s, 100% at 2.2 s.
 *
 * ⚠️ The revision before this one climbed to 85% and then approached 100%
 * asymptotically and **never reached it** (99.95%). That was the honest answer to
 * "接近百分百的时候稍微慢一点等加载", but it means the number never shows 100 —
 * and the last few percent of an asymptote are indistinguishable from a freeze
 * anyway. `shown >= 1` is now a real state, and while the page is not ready it is
 * reported by the STATUS line ("Waiting on assets") rather than by pretending the
 * count still has somewhere to go.
 */
const COUNT_MS = 2200;
/** The eased floor's cap, exactly as in the reference. */
const FLOOR_CAP = 0.85;
/** The fast-forward's own duration once the page turns out to be ready early. */
const SETTLE_MS = 260;
/**
 * Long enough for the entrance choreography to have played (its last arrival ends
 * at ~1.36 s), short enough not to be a wait.
 */
const MIN_MS = 1400;
/** After this the intro lifts regardless of what is still loading. */
const MAX_MS = 3200;
/**
 * ⚠️ **The optional assets get a SHORTER budget than the page, and that is not a
 * micro-optimisation.** The black-hole video and the webfonts are nice to have and
 * the text and layout are not, so waiting for all of them for the full `MAX_MS`
 * means a slow video holds the cover for three seconds and then the status snaps
 * from "waiting" straight to the end — the visitor waited for something that was
 * never going to arrive. Giving them their own earlier deadline lets the intro
 * say "we are nearly there" and then genuinely finish.
 */
const OPTIONAL_MS = 2200;

/**
 * The exit, in three beats. Mirrors §16's transitions — change one, change both.
 *
 * ⚠️ `is-revealing` (the dissolve) is applied only after the panel has been at
 * full height for `SWEEP_HOLD_MS`, and it is what drops the plate: everything
 * under the panel goes away while the panel is still opaque, so the dissolve
 * lands on the live page instead of on the cover.
 *
 * ⚠️ `SWEEP_FADE_MS` is the LAST thing the visitor sees, and it is deliberately
 * the slowest beat (2026-09-19: "橙色画面结束后…这个消失过渡动画时间做长一点，让过渡柔和
 * 一些"). At 720ms the panel read as being pulled away rather than as scattering;
 * 1250ms with a wider blur gives the arrival something to land through. Nothing
 * waits on this — the reveal handler has already fired by the time it starts.
 */
const SWEEP_GROW_MS = 620;
const SWEEP_HOLD_MS = 280;
const SWEEP_FADE_MS = 1250;
/** The status line's dip-and-swap. Mirrors the CSS transition. */
const SWITCH_MS = 150;

type IntroWindow = Window & {
  __rrsIntroResolve?: () => void;
};

/** The black-hole video is injected with `data-src`, and only on desktop, so
 *  this waits for the element rather than just for its data. */
function waitForVideo(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    signal.addEventListener("abort", () => resolve(), { once: true });
    const tick = () => {
      const video = document.querySelector<HTMLVideoElement>("#blackhole-layer video");
      if (!video || video.readyState >= 2) return resolve();
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

function waitForFonts(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    signal.addEventListener("abort", () => resolve(), { once: true });
    if (!document.fonts?.ready) return resolve();
    document.fonts.ready.then(() => resolve()).catch(() => resolve());
  });
}

function waitForLoad(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === "complete") return resolve();
    signal.addEventListener("abort", () => resolve(), { once: true });
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/** Two frames after everything else: enough for the canvases to have drawn. */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** `(v − a) / (b − a)`, guarded against a zero-length window. */
const progressOf = (a: number, b: number, v: number) => {
  const span = b - a;
  return span <= 0 ? 1 : Math.max(0, Math.min(1, (v - a) / span));
};

/**
 * What the status line says while the count is still climbing.
 *
 * ⚠️ It reports the WAIT, not the boot: the site's job here is not to invent a
 * sequence of subsystems, it is to say honestly which things it is still holding
 * for. Everything past the last threshold is not a phase of this list — it is
 * either "waiting" or "ready", and both are decided by the load, not by the count.
 */
const PHASES: { at: number; text: string }[] = [
  { at: 0, text: "Initialising" },
  { at: 0.28, text: "Loading assets" },
  { at: 0.62, text: "Calibrating layers" },
];

const WAITING_TEXT = "Waiting on assets";
const READY_TEXT = "Ready";

export function initSiteIntro(): void {
  const root = document.documentElement;
  if (!root.classList.contains("is-intro")) return; // skipped, or already open
  const el = document.getElementById("site-intro");
  if (!el) return;

  const rail = document.getElementById("site-intro-rail");
  const pct = document.getElementById("site-intro-pct");
  const status = document.getElementById("site-intro-status");
  const started = performance.now();

  let ready = false;
  let opened = false;
  let shown = 0;

  // The fast-forward's own state, armed the first frame `ready` is seen.
  let settling = false;
  let settleFrom = 0;
  let settleAt = 0;
  let settleT0 = 0;

  let lastLabel = PHASES[0].text;
  let wasReady = false;
  let wasWaiting = false;
  let switchTimer = 0;

  /**
   * Swap the status text by dipping it out, changing the word and bringing it
   * back — a cut in a line that is being read is the one thing that makes a
   * loader look like it is glitching rather than working.
   */
  function setStatus(text: string): void {
    if (!status) return;
    window.clearTimeout(switchTimer);
    status.classList.add("is-switching");
    switchTimer = window.setTimeout(() => {
      if (status) status.textContent = text;
      status.classList.remove("is-switching");
    }, SWITCH_MS);
  }

  /**
   * The exit. Three beats, and the order of them is the whole effect:
   * the readout steps out → the signal rises → it dissolves into the page.
   */
  function open(): void {
    if (opened) return;
    opened = true;
    const hold = Math.max(0, MIN_MS - (performance.now() - started));
    window.setTimeout(() => {
      el?.classList.add("is-sweeping");
      // One frame so the rising panel's own first paint is separate from the
      // class change (a transition started in the same frame as the style that
      // arms it can be folded away).
      requestAnimationFrame(() => {
        // The shelf holds its own curtain and rise on this. Resolving here —
        // rather than at the end — means the page underneath is already in
        // motion when the panel dissolves, so the intro and the shelf read as
        // one continuous entrance instead of two black screens in a row.
        (window as IntroWindow).__rrsIntroResolve?.();
        window.setTimeout(() => {
          // The panel is fully up: drop everything under it, then dissolve it.
          el?.classList.add("is-revealing");
          root.classList.remove("is-intro");
          window.setTimeout(() => el?.remove(), SWEEP_FADE_MS + 80);
        }, SWEEP_GROW_MS + SWEEP_HOLD_MS);
      });
    }, hold);
  }

  const paint = (now: number) => {
    if (opened) return;
    const elapsed = now - started;

    // ── The ladder: the reference's fast head and linear tail, to exactly 100. ──
    const t = Math.min(1, elapsed / COUNT_MS);
    shown = t >= 1 ? 1 : Math.max(t, easeOutCubic(t) * FLOOR_CAP);

    // ── Ready early: fast-forward the remainder rather than jumping. ──
    // ⚠️ The remainder still RUNS — snapping the last forty percent in one frame
    // is the one shape a counter must never have. It lands no earlier than
    // `MIN_MS`, so a page that is ready on the first frame still gets a visible
    // 0 → 100 and a full entrance choreography.
    if (ready && shown < 1) {
      if (!settling) {
        settling = true;
        settleFrom = shown;
        settleT0 = elapsed;
        settleAt = Math.max(MIN_MS, elapsed + SETTLE_MS);
      }
      const u = progressOf(settleT0, settleAt, elapsed);
      shown = Math.max(shown, settleFrom + (1 - settleFrom) * easeOutCubic(u));
      if (elapsed >= settleAt) shown = 1;
    }

    // ── Paint. Three digits, zero-padded, exactly as the reference does. ──
    const pctText = String(Math.round(shown * 100)).padStart(3, "0");
    if (pct && pct.textContent !== pctText) pct.textContent = pctText;

    if (rail) rail.style.setProperty("--reveal", `${(shown * 100).toFixed(2)}%`);

    // ── Status: which phase, or whether the count is spent and the page is not. ──
    // ⚠️ While the count is climbing the label follows the LADDER, not the load —
    // a fast page would otherwise go straight from "Initialising" to "Ready" and
    // the boot sequence would never be legible. The load only decides the two
    // states that are true statements about it: spent-and-waiting, and ready.
    const waiting = shown >= 1 && !ready;
    let next = 0;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (shown >= PHASES[i].at) {
        next = i;
        break;
      }
    }
    const label =
      shown >= 1 ? (ready ? READY_TEXT : WAITING_TEXT) : PHASES[next].text;

    if (ready !== wasReady) {
      wasReady = ready;
      el.classList.toggle("is-ready", ready);
    }
    if (waiting !== wasWaiting) {
      wasWaiting = waiting;
      el.classList.toggle("is-waiting", waiting);
    }
    if (label !== lastLabel) {
      lastLabel = label;
      setStatus(label);
    }

    // The cover only lifts once the count has arrived AND the page can draw.
    if (shown >= 1 && ready) open();
    else requestAnimationFrame(paint);
  };

  // Two budgets, not one. `waitForLoad` is the page itself and gets the full cap;
  // the fonts and the video are optional and get `OPTIONAL_MS`, so a stalled video
  // costs 2.2 s of the cover rather than 3.2 s. See the note on `OPTIONAL_MS`.
  const page = new AbortController();
  window.setTimeout(() => page.abort(), MAX_MS);
  const optional = new AbortController();
  window.setTimeout(() => optional.abort(), OPTIONAL_MS);

  Promise.all([
    waitForLoad(page.signal),
    waitForFonts(optional.signal),
    waitForVideo(optional.signal),
  ])
    .then(waitForPaint)
    .catch(() => undefined)
    .then(() => {
      ready = true;
    });

  requestAnimationFrame(paint);
}
