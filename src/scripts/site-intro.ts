/**
 * Site intro / preloader — the visual half.
 *
 * A document opens: two paper halves with a hairline seam, a rail that fills, a
 * counter that climbs. It lifts when the page can actually draw — the black-hole
 * video has a frame, the fonts are in, `window.load` has fired — so the first
 * thing anyone sees is a finished page rather than a page assembling itself.
 *
 * ⚠️ **Whether it plays at all is decided in <head>, not here.** The inline
 * guard in `Layout.astro` runs before the first paint and tags the document
 * either `is-intro` or `is-intro-skip`; a module script runs after the body is
 * parsed, which is late enough that a link navigation would show the cover for a
 * few hundred milliseconds and then snatch it away. Everything below only
 * assumes `is-intro` was set, and the guard's own safety net will still open the
 * cover if this file never runs.
 *
 * ⚠️ Nothing here may be able to trap the page: the readiness waits, the minimum
 * display time and the open all resolve against the guard's 6 s cap, and the
 * gate the shelf waits on is resolved by the guard too.
 */

/** Long enough to read as a designed moment, short enough not to be a wait. */
const MIN_MS = 900;
/** After this the intro lifts regardless of what is still loading. */
const MAX_MS = 4200;
/** How long the halves take to open. Mirrors the CSS transition. */
const OPEN_MS = 620;
/** The rail's own pace: 92% of it is time-based, the last 8% waits for ready. */
const FILL_MS = 1150;

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

export function initSiteIntro(): void {
  const root = document.documentElement;
  if (!root.classList.contains("is-intro")) return; // skipped, or already open
  const el = document.getElementById("site-intro");
  if (!el) return;

  const fill = el.querySelector<HTMLElement>(".site-intro__fill");
  const tip = el.querySelector<HTMLElement>(".site-intro__tip");
  const pct = document.getElementById("site-intro-pct");
  const started = performance.now();

  let ready = false;
  let opened = false;

  function open(): void {
    if (opened) return;
    opened = true;
    const hold = Math.max(0, MIN_MS - (performance.now() - started));
    window.setTimeout(() => {
      el?.classList.add("is-leaving");
      root.classList.remove("is-intro");
      // The shelf holds its own curtain and rise on this: two intros in sequence
      // instead of one playing unseen underneath the other.
      (window as IntroWindow).__rrsIntroResolve?.();
      window.setTimeout(() => el?.remove(), OPEN_MS + 80);
    }, hold);
  }

  // The rail is one time-based climb; `ready` only releases the last 8%.
  const paint = () => {
    if (opened) return;
    const t = Math.min(1, (performance.now() - started) / FILL_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = ready ? 100 : Math.min(92, eased * 92);
    if (fill) fill.style.transform = `scaleX(${(value / 100).toFixed(4)})`;
    if (tip) tip.style.left = `${value.toFixed(2)}%`;
    if (pct) pct.textContent = String(Math.round(value));
    if (value >= 100) open();
    else requestAnimationFrame(paint);
  };

  const controller = new AbortController();
  window.setTimeout(() => controller.abort(), MAX_MS);

  Promise.all([
    waitForLoad(controller.signal),
    waitForFonts(controller.signal),
    waitForVideo(controller.signal),
  ])
    .then(waitForPaint)
    .catch(() => undefined)
    .then(() => {
      ready = true;
    });

  requestAnimationFrame(paint);
}
