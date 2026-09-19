/**
 * Circular-reveal theme switch — a WAVE of real page snapshots.
 *
 * The theme is a `data-theme` attribute on <html>, so the colour swap itself is
 * one style recalc. The gesture on top is a stack of full-page COPIES of the
 * page — one per click — each carrying its own `data-theme` and clipped to a
 * circle that grows from that click's point:
 *
 *   .theme-stack    fixed, whole-viewport, pointer-events:none holder. Appended
 *                   to <html>, NOT to <body>, so cloning the body can never
 *                   clone the stack itself.
 *   .theme-ripple   one full-page copy of the page. Each click adds one on top,
 *                   clipped to its own growing circle. The bottom one (`base`)
 *                   is the theme being LEFT BEHIND; it is unclipped, and it is
 *                   skipped entirely when that theme is already the one the
 *                   parked root shows — the live document is that layer.
 *
 * ⚠️ **Why copies instead of a filled disc.** The first version of this (v1.19 /
 * v1.20) painted the target theme's BACKGROUND COLOUR into each circle. That
 * hides the page: inside the growing disc every word and card vanishes, so the
 * gesture reads as "screen goes black" and then the real page has to fade back
 * in from underneath — the circle and the emergence are two disconnected events.
 * A circle that reveals the *actual rendering* of the other theme has no such
 * seam: the pixels inside the ring are already final, so when the last circle
 * covers the viewport the copies can be dropped in the very same frame and
 * nothing changes visually.
 *
 * ⚠️ **Why not the View Transitions API**, which is the cheap way to get those
 * snapshots. Only ONE view transition can be in flight: a second click during a
 * reveal is dropped, so the button is dead for the length of the animation —
 * exactly the bug the user reported. Copies have no such limit: N clicks are N
 * circles, all growing at once, which is the ripple they asked for.
 *
 * ⚠️ **Copies need a theme that is not the root's.** The page's light-theme
 * rules are all `:root[data-theme="light"] …`, and `:root` only ever matches
 * <html> — a copy nested in the document can never match it. So we build a
 * second, scoped copy of those rules at runtime (`buildScope()`): every
 * `:root[data-theme=…]` selector is re-emitted as `.theme-scope[data-theme=…]`,
 * which the copy root also carries. Nothing in the page's own CSS changes, and
 * the scoped rules can only ever match inside a copy.
 */

const STORAGE_KEY = "rrsuika-theme";

/** One circle's growth. The first is the reference's beat; a ripple that lands
 *  on top of a running one is quicker, so a volley settles sooner and fewer
 *  full-page layers are alive at the same time. */
const REVEAL_MS = 620;
const RIPPLE_MS = 460;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Safety net: a burst always closes, even if an animation never settles. */
const GUARD_MS = 1600;

/**
 * ⚠️ The theme the document root sits on while a burst is running.
 *
 * While <html> is `light`, every `:root[data-theme="light"] …` rule in the
 * project ALSO matches inside a copy — `:root` matching has nothing to do with
 * where the copy sits — so a copy of the DARK theme gets the light theme's
 * panel, header and footer handed to it on top of its own dark tokens. Measured
 * before this existed: the shelf panel rendered rgb(206,203,198) inside a dark
 * copy, mean |Δ| 107 across the frame.
 *
 * Fixing it from the copy's side is impossible (there is no `:root[data-theme=
 * "dark"]` block to re-assert, and a copy cannot un-set a declaration it never
 * made), so the root is taken off `light` for the duration instead: `dark` is
 * the page's own `:root` default, which is exactly the theme that has NO
 * attribute-specific rules. Copies are themed by their own scoped rules, so
 * they do not care what the root says. The pending theme is applied when the
 * burst lands, in the same frame the copies go.
 */
const NEUTRAL_THEME: Theme = "dark";

/** Scope class for the generated rules, and the marker that keeps the stack out
 *  of any copy. */
const SCOPE_CLASS = "theme-scope";
const STACK_ATTR = "data-theme-stack";

type Theme = "light" | "dark";

interface Ripple {
  el: HTMLDivElement;
  theme: Theme;
  /** Thrown away once the ripple has landed; only kept so the guard can panic. */
  done: boolean;
}

let stack: HTMLDivElement | null = null;
/** The theme being left behind, painted under every ripple of this burst. */
let base: HTMLDivElement | null = null;
let ripples: Ripple[] = [];
/** Scoped light/dark rules are built once, off the critical path. */
let scopeState: "idle" | "ready" | "failed" = "idle";
let guardTimer = 0;
let scrollBound = false;
/** The black-hole video's frozen frame, reused by every ripple of a burst. */
let posterCache: string | null = null;
/** The theme the burst will land on. Non-null exactly while a burst is live,
 *  because the root's own attribute is parked on NEUTRAL_THEME until then. */
let pending: Theme | null = null;

/* ── theme plumbing ─────────────────────────────────────────────────────── */

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function rootTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/** The theme the page is *meant* to be showing, which during a burst is the
 *  one the last click chose rather than what the root happens to carry. */
function intentTheme(): Theme {
  return pending ?? rootTheme();
}

/**
 * Bring the starfield back gradually when the page lands on the dark theme.
 *
 * ⚠️ Without this the field is a hard cut: light mode sets `display: none` on the
 * canvases, so the frame the swap lands on they appear at full strength — the
 * user reported it as "圆环覆盖过后，星空是直接刷新在画面上，这样太突兀了".
 * The fade is a CSS keyframe animation (see `sfArrive` in §10 of global.css) and
 * this only toggles the class that starts it. The class is removed once the
 * animation has finished so a later switch can start it again — a class that is
 * already present cannot re-trigger its own animation.
 *
 * It runs on the frame AFTER the swap, deliberately: `applyInstant` swaps with
 * transitions disabled, and starting the animation in that same frame would let
 * the "transitions off" rule swallow the first tick.
 */
const ARRIVE_MS = 1100;

function arriveBackground(): void {
  const els = ["starfield-canvas", "lens-canvas"]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (els.length === 0) return;

  requestAnimationFrame(() => {
    for (const el of els) el.classList.add("sf-arrive");
    window.setTimeout(() => {
      for (const el of els) el.classList.remove("sf-arrive");
    }, ARRIVE_MS);
  });
}

function setRoot(next: Theme): void {
  document.documentElement.setAttribute("data-theme", next);
  document.documentElement.style.colorScheme = next;
}

function persist(next: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode / storage disabled — the attribute alone is enough */
  }
}

/** Swap the theme with every transition switched off for exactly one recalc.
 *
 *  ⚠️ Not an optimisation. The page animates themed colour: `body` alone has a
 *  400 ms background/colour transition, and dozens of elements transition a
 *  border or a shadow. Landing a burst with those live means the live page fades
 *  from the old theme to the new one *after* the copies are gone — the exact
 *  "it goes dark and then the page surfaces out of it" the reveal exists to
 *  remove. `transition: none !important` during the swap, a forced recalc, then
 *  the class comes off: nothing changed while transitions were off, so nothing
 *  animates when they come back. */
function applyInstant(next: Theme): void {
  const root = document.documentElement;
  const cameFrom = rootTheme();
  root.classList.add("theme-land");
  setRoot(next);
  persist(next);
  void root.offsetHeight; // flush style + layout while transitions are off
  root.classList.remove("theme-land");

  // ⚠️ The starfield fade belongs HERE, at the landing — not in `setRoot`. During
  // a burst the root is parked on the neutral theme, so `setRoot` fires while the
  // page is still covered by the copies; the fade would burn itself out behind
  // them and the visitor would still see the field cut in. This is the one swap
  // that is actually visible, so this is where the class goes.
  if (next === "dark" && cameFrom !== "dark") arriveBackground();
}

/** A usable click point, or null.
 *
 *  ⚠️ `(0, 0)` is rejected on purpose. A synthetic `element.click()` — and any
 *  keyboard activation routed through it — carries `clientX/clientY === 0`,
 *  because there is no pointer behind it. Accepting that puts the circle in the
 *  viewport's top-left corner, which reads as a diagonal wipe rather than a
 *  ripple from the button. */
function usableOrigin(origin?: { x: number; y: number }): { x: number; y: number } | null {
  if (!origin) return null;
  const { x, y } = origin;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x === 0 && y === 0) return null;
  return { x, y };
}

/** Fallback origin: the toggle itself, else the viewport centre. */
function buttonOrigin(): { x: number; y: number } {
  const knob = document.querySelector(".theme-switch");
  if (knob) {
    const r = knob.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

/** Distance to the farthest corner, plus a pixel: the radius that clears the
 *  viewport with no hairline seam at the edges. */
function cornerRadius(x: number, y: number): number {
  return (
    Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ) + 2
  );
}

/* ── scoped theme rules, generated from the page's own CSS ──────────────── */

/**
 * ⚠️ A bare `:root` counts too, and that is not optional. The DARK theme is the
 * page's `:root { … }` default — there is no `:root[data-theme="dark"]` block —
 * so a dark copy that only re-declared the light block would inherit whatever
 * the live root currently is. A dark copy inside a light document would render
 * in light tokens: a wrong-coloured sheet appearing under the circle, which is
 * precisely the artefact this whole mechanism exists to avoid.
 *
 * `.theme-scope` (0,1,0) sets the defaults on the copy root; the light block is
 * `.theme-scope[data-theme="light"]` (0,2,0) and therefore still wins.
 */
const ROOT_THEME_RE = /:root(\[data-theme[^\]]*\])?/g;

function scopedSelector(selectorText: string): string {
  return selectorText.replace(ROOT_THEME_RE, `.${SCOPE_CLASS}$1`);
}

/** Walk a rule list, re-emitting every theme-gated rule with a scope class.
 *  Grouping rules (@media, @supports, @layer, @container) keep their prelude so
 *  a conditioned override still only applies under its condition. */
function collectScoped(rules: CSSRuleList, out: string[]): number {
  let found = 0;
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (!rule.selectorText.includes(":root")) continue;
      out.push(`${scopedSelector(rule.selectorText)}{${rule.style.cssText}}`);
      found += 1;
      continue;
    }
    const grouped = rule as CSSRule & { cssRules?: CSSRuleList };
    if (!grouped.cssRules || !grouped.cssRules.length) continue;
    // `cssText` of a grouping rule is "prelude { children }" — keep the prelude.
    const prelude = rule.cssText.slice(0, rule.cssText.indexOf("{")).trim();
    if (!prelude) continue;
    const inner: string[] = [];
    const n = collectScoped(grouped.cssRules, inner);
    if (!n) continue;
    out.push(`${prelude}{${inner.join("")}}`);
    found += n;
  }
  return found;
}

/** Build the scoped copy of the page's theme rules. Returns false if the
 *  stylesheets are unreadable (cross-origin only), in which case a copy could
 *  not be themed and the caller falls back to an instant swap. */
function buildScope(): boolean {
  const out: string[] = [];
  let found = 0;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin (web fonts) — it holds no theme rules
    }
    if (rules) found += collectScoped(rules, out);
  }
  if (!found) return false;
  const style = document.createElement("style");
  style.id = "theme-scope-rules";
  style.textContent = out.join("");
  document.head.appendChild(style);
  return true;
}

/** Build eagerly while the page is quiet: the sheet lands before anything is
 *  animating, and the first click does not pay for it. */
function warmScope(): void {
  if (scopeState !== "idle") return;
  const run = () => {
    if (scopeState !== "idle") return;
    scopeState = buildScope() ? "ready" : "failed";
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => run(), { timeout: 2500 });
  } else {
    window.setTimeout(run, 1200);
  }
}

/* ── the layer stack ────────────────────────────────────────────────────── */

function stackEl(): HTMLDivElement | null {
  if (stack && stack.isConnected) return stack;
  if (!document.documentElement) return null;
  stack = document.createElement("div");
  stack.className = "theme-stack";
  stack.setAttribute(STACK_ATTR, "");
  stack.setAttribute("aria-hidden", "true");
  (stack as HTMLElement & { inert?: boolean }).inert = true;
  // ⚠️ Sibling of <body>, not a child. A stack inside the body would be copied
  // by the next clone, and a copy of a copy is a full extra page per click.
  document.documentElement.appendChild(stack);
  return stack;
}

/**
 * ⚠️ **The click must not do the layout.** Building a copy is cheap in script
 * (`cloneNode` 1.4 ms, wrap + append 1 ms) but the browser then has to lay out
 * and paint ~700 nodes, and that frame measured **101 ms** in headless — a
 * visible freeze exactly at the moment of the click, which is what "the toggle
 * is not silky" turns out to be. The reveal itself is not the problem: with the
 * copies hidden it costs about the same as the idle page.
 *
 * So a press warms what the click is going to need, one event early.
 * `pointerdown` fires 50-150 ms before `click`, which is enough to lay the
 * copies out behind `visibility: hidden`; the click then only flips one visible
 * and starts the tween.
 *
 * Freshness is the whole contract: warmed copies are only used if they were
 * built within WARM_MS, so they are a picture of the page as it is being
 * clicked. A keyboard activation has no pointer event to warm on and simply
 * builds on the click, as before.
 */
const WARM_MS = 400;

interface WarmSet {
  /** The theme being left, when it needs a copy of its own (see NEUTRAL_THEME). */
  base: HTMLDivElement | null;
  /** The theme the click will reveal. */
  ripple: HTMLDivElement;
  builtFor: Theme;
  at: number;
}

let warm: WarmSet | null = null;
let warmTimer = 0;

function discardWarm(): void {
  window.clearTimeout(warmTimer);
  warmTimer = 0;
  warm?.base?.remove();
  warm?.ripple.remove();
  warm = null;
}

/** Lay out the hidden copies the next click will need. */
function buildWarm(): void {
  const holder = stackEl();
  if (!holder || scopeState !== "ready") return;

  const leaving = intentTheme();
  const theme: Theme = leaving === "light" ? "dark" : "light";
  if (warm && warm.builtFor === leaving && performance.now() - warm.at < WARM_MS) return;

  discardWarm();
  const make = (t: Theme): HTMLDivElement | null => {
    const layer = clonePage(t);
    if (!layer) return null;
    layer.style.clipPath = "circle(0px at 50% 50%)";
    layer.style.visibility = "hidden";
    holder.appendChild(layer);
    return layer;
  };

  const ripple = make(theme);
  if (!ripple) return;
  // Leaving the neutral theme needs no base copy: the document underneath is
  // already that theme (see NEUTRAL_THEME).
  const base = leaving === NEUTRAL_THEME ? null : make(leaving);

  warm = { base, ripple, builtFor: leaving, at: performance.now() };
  // An unused set must not sit in the document for ever.
  warmTimer = window.setTimeout(discardWarm, WARM_MS + 1500);
}

/** Called at the start of a click: hands over both warmed layers, or neither. */
function claimWarm(leaving: Theme): { base: HTMLDivElement | null; ripple: HTMLDivElement | null } {
  if (!warm || warm.builtFor !== leaving || performance.now() - warm.at > WARM_MS) {
    discardWarm();
    return { base: null, ripple: null };
  }
  const set = warm;
  warm = null;
  window.clearTimeout(warmTimer);
  warmTimer = 0;
  set.ripple.style.visibility = "";
  if (set.base) set.base.style.visibility = "";
  return { base: set.base, ripple: set.ripple };
}

/** Warm on press, for a real pointer only. */
function bindWarm(): void {
  document.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target as Element | null;
      if (!target?.closest?.(".theme-switch")) return;
      buildWarm();
    },
    { passive: true },
  );
}

/** A frozen still of the black-hole video, so a copy does not start a second
 *  decoder. Cached for the whole burst — the video drifts slowly and the copies
 *  only live for a few hundred milliseconds. */
function videoStill(video: HTMLVideoElement): string | null {
  if (posterCache) return posterCache;
  if (video.readyState < 2 || !video.videoWidth) return null;
  try {
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext("2d")?.drawImage(video, 0, 0);
    posterCache = c.toDataURL("image/jpeg", 0.82);
    return posterCache;
  } catch {
    return null;
  }
}

/** One full-page copy of the page, locked to `theme`. This is the whole trick:
 *  the DOM clone keeps the layout, the canvas bitmaps keep the moving parts, and
 *  the scope class + `data-theme` keep the colours from following the root. */
function clonePage(theme: Theme): HTMLDivElement | null {
  const src = document.body;
  if (!src) return null;

  const layer = document.createElement("div");
  layer.className = `${SCOPE_CLASS} theme-ripple`;
  layer.setAttribute("data-theme", theme);
  layer.setAttribute("aria-hidden", "true");
  (layer as HTMLElement & { inert?: boolean }).inert = true;

  // A real <body> element, so the page's `body { … }` rule and — more
  // importantly — `body::before/::after` (the grid, noise and scanline layers)
  // still apply inside the copy.
  const copy = document.createElement("body");
  for (const child of Array.from(src.children)) {
    if (child.tagName === "SCRIPT") continue;
    copy.appendChild(child.cloneNode(true));
  }

  // Canvas elements clone empty: the bitmap is not part of the DOM.
  const srcCanvas = src.querySelectorAll("canvas");
  const dstCanvas = copy.querySelectorAll("canvas");
  srcCanvas.forEach((from, i) => {
    const to = dstCanvas[i];
    if (!(from instanceof HTMLCanvasElement) || !(to instanceof HTMLCanvasElement)) return;
    try {
      to.width = from.width;
      to.height = from.height;
      to.getContext("2d")?.drawImage(from, 0, 0);
    } catch {
      /* an empty canvas is better than a broken reveal */
    }
  });

  // Videos clone as live players: they would re-download, re-decode and drift
  // out of sync. Show the current frame as a poster instead.
  const srcVideo = src.querySelectorAll("video");
  const dstVideo = copy.querySelectorAll("video");
  srcVideo.forEach((from, i) => {
    const to = dstVideo[i];
    if (!(from instanceof HTMLVideoElement) || !(to instanceof HTMLVideoElement)) return;
    const still = videoStill(from);
    if (!still) {
      to.remove();
      return;
    }
    to.poster = still;
    to.removeAttribute("src");
    to.removeAttribute("data-src");
    to.removeAttribute("autoplay");
    try {
      to.load();
    } catch {
      /* the poster is already set */
    }
  });

  // The copy is static, so it has to be nudged to the same scroll offset.
  const marginTop = parseFloat(getComputedStyle(src).marginTop) || 0;
  layer.dataset.marginTop = String(marginTop);
  copy.style.marginTop = `${marginTop - window.scrollY}px`;

  layer.appendChild(copy);
  return layer;
}

function offsetClones(): void {
  const y = window.scrollY;
  const all: (HTMLDivElement | null)[] = [base, ...ripples.map((r) => r.el)];
  for (const layer of all) {
    if (!layer) continue;
    const copy = layer.firstElementChild as HTMLElement | null;
    if (!copy) continue;
    const marginTop = Number(layer.dataset.marginTop ?? 0) || 0;
    copy.style.marginTop = `${marginTop - y}px`;
  }
}

function bindScroll(): void {
  if (scrollBound) return;
  scrollBound = true;
  window.addEventListener("scroll", offsetClones, { passive: true });
}

function unbindScroll(): void {
  if (!scrollBound) return;
  scrollBound = false;
  window.removeEventListener("scroll", offsetClones);
}

function dropLayers(): void {
  window.clearTimeout(guardTimer);
  guardTimer = 0;
  unbindScroll();
  for (const r of ripples) r.el.remove();
  ripples = [];
  base?.remove();
  base = null;
  posterCache = null;
}

/** Close the burst: the pending theme becomes the real one in the same frame the
 *  copies go, so the two are never both visible for an instant — or neither. */
function landBurst(): void {
  const final = pending;
  dropLayers();
  pending = null;
  if (final) applyInstant(final);
}

/** Give up on the reveal without stranding the click: the theme still applies. */
function abortBurst(next: Theme): void {
  dropLayers();
  pending = null;
  applyInstant(next);
}

/** A ripple has landed: it now covers the viewport, so everything under it is
 *  hidden for good — and if it is the top one, the burst can close. */
function onRippleDone(entry: Ripple): void {
  entry.done = true;
  const index = ripples.indexOf(entry);
  if (index < 0) return;

  for (const under of ripples.slice(0, index)) under.el.remove();
  base?.remove();
  base = null;
  ripples = ripples.slice(index);

  if (ripples[ripples.length - 1] === entry) landBurst();
  else offsetClones();
}

/** A burst must never wedge. If the last ripple has not landed within the guard
 *  window, close the burst on the theme the clicks asked for. */
function armGuard(): void {
  window.clearTimeout(guardTimer);
  guardTimer = window.setTimeout(() => {
    if (!ripples.length) return;
    landBurst();
  }, GUARD_MS);
}

/* ── the gesture ────────────────────────────────────────────────────────── */

export function toggleThemeWithReveal(origin?: { x: number; y: number }): void {
  const leaving = intentTheme();
  const next: Theme = leaving === "light" ? "dark" : "light";

  if (reducedMotion() || !document.body || !document.documentElement) {
    abortBurst(next);
    return;
  }

  if (scopeState === "idle") scopeState = buildScope() ? "ready" : "failed";
  const holder = scopeState === "ready" ? stackEl() : null;
  if (!holder) {
    abortBurst(next);
    return;
  }

  const point = usableOrigin(origin) ?? buttonOrigin();
  const x = point.x;
  const y = point.y;
  const radius = cornerRadius(x, y);
  const first = ripples.length === 0;
  // One event's worth of head start, if a press provided it.
  const held = first ? claimWarm(leaving) : { base: null, ripple: null };

  try {
    if (first) {
      // The theme being left behind, under the whole wave.
      //
      // ⚠️ Only needed when that theme is NOT the neutral one. The root is about
      // to be parked on NEUTRAL_THEME, so when the page is already there the
      // live document underneath IS the layer this would have added.
      base = held.base ?? (leaving === NEUTRAL_THEME ? null : clonePage(leaving));
      if (base) {
        base.dataset.themeBase = "";
        holder.appendChild(base);
      }
    }

    const layer = held.ripple ?? clonePage(next);
    if (!layer) throw new Error("clone failed");

    // ⚠️ Clip it away before it is ever painted. The tween re-states this in its
    // first keyframe, but a layer that is briefly unclipped is a full-screen
    // flash of the incoming theme.
    layer.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    layer.style.willChange = "clip-path";
    layer.style.visibility = "";
    holder.appendChild(layer);

    const entry: Ripple = { el: layer, theme: next, done: false };
    ripples.push(entry);

    // ⚠️ Order matters, and it is not the obvious one. The root is parked on the
    // neutral theme — NOT on `next` — because a light root would hand its own
    // theme rules to the dark copies underneath (see NEUTRAL_THEME). The page
    // behind the copies is therefore showing the neutral theme, which is also
    // what makes the landing (`setRoot(final)`) a real swap rather than a no-op
    // when the burst ends on dark.
    setRoot(NEUTRAL_THEME);
    persist(next);
    pending = next;

    const anim = layer.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${radius.toFixed(1)}px at ${x}px ${y}px)` },
      ],
      { duration: first ? REVEAL_MS : RIPPLE_MS, easing: EASING, fill: "forwards" },
    );
    // ⚠️ The first frame of a new layer is its most expensive one: the browser
    // lays out ~700 nodes and rasters a viewport-sized layer. A warmed copy has
    // already done the layout (see `buildWarm`), but the raster lands here. So
    // the tween is held for one frame and then released: at radius 0 nothing of
    // the copy is on screen, which means the expensive frame happens where it
    // cannot be seen, and the circle then grows over a layer that is already
    // painted. Measured on the click: 100 ms of freeze became one hidden frame.
    anim.pause();
    requestAnimationFrame(() => {
      if (!anim.playState || anim.playState === "idle") return;
      anim.play();
    });
    // Swallow the rejection a removed node produces mid-flight.
    anim.finished.then(() => onRippleDone(entry)).catch(() => undefined);

    bindScroll();
    armGuard();
  } catch {
    // Never leave the click unanswered: whatever went wrong, the theme applies.
    abortBurst(next);
  }
}

warmScope();
bindWarm();

window.addEventListener("resize", () => {
  // Copies are laid out for the old viewport; land the burst now rather than
  // showing a stale one, and throw away anything warmed for the old size.
  discardWarm();
  if (ripples.length) landBurst();
});
