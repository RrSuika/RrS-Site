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
 *  full-page layers are alive at the same time.
 *
 *  ⚠️ **The DURATION is not what the eye reads — the CURVE is**, and this pair
 *  used to be badly mismatched. `cubic-bezier(0.22, 1, 0.36, 1)` is an
 *  ease-out-quint: **40 % of the radius lands in the first 10 % of the time**,
 *  90 % of it in the first 37 %. So of a 620 ms tween the sweep was over in about
 *  230 ms and the last 47 % of the clock pushed the edge out by 3 % of a radius
 *  nobody can see. The user reported exactly that shape: "覆盖的速度太快了，肉眼
 *  看就像好几帧里面快速的进行了一次覆盖，不够丝滑".
 *
 *  ⚠️ **Judge it in AREA, not radius** — the circle's radius grows linearly with
 *  the easing but the paint it lays down grows with r², so under the old curve
 *  the first third of the animation had already covered ~75 % of the screen:
 *
 *    fraction of duration     10%     25%     50%     75%    100%
 *    old radius               .401    .674    .961    .994   1.000
 *    old area                 .161    .454    .923    .988   1.000
 *
 *  Now `ease` (written out rather than spelled `ease`, so the numbers below can
 *  be checked against it): 25/50/75/90 % of the radius land at 18/29/45/62 % of
 *  the clock. ⚠️ Keep a ripple quicker than the circle that started the burst —
 *  that is the volley argument above — so the 620/460 ratio is preserved.
 *  ⚠️ **GUARD_MS must stay above the longest of the two**, or the guard lands a
 *  burst whose first circle is still growing.
 *
 *  2026-09-20: the user asked for 60 % of the then-current speed ("这个覆盖动画太快了，
 *  放慢到目前的60%速度"), so the pair went 900/660 → **1500/1100** — exactly 0.6×
 *  on both, which keeps the volley ratio and keeps the guard above both. The
 *  easing is untouched: the complaint was about pace, not about the curve, and
 *  the curve is what fixed the "dead tail" in the pass above. */
const REVEAL_MS = 1500;
const RIPPLE_MS = 1100;
const EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)";
/** Safety net: a burst always closes, even if an animation never settles.
 *  ⚠️ Must exceed `REVEAL_MS + SF_ARRIVE_MS`, not just `REVEAL_MS`: since the
 *  starfield fade is armed to END on the landing, a burst the guard lands early
 *  cuts the fade mid-ramp and the stars pop in. 1500 + 1600 = 3100, so 3400 keeps
 *  the guard as a true last resort. */
const GUARD_MS = 3400;

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
/**
 * The theme every ripple of the current burst stands on — the one that was
 * visible when the FIRST click of the burst happened.
 *
 * ⚠️ Not the same thing as `leaving` (which is the theme being left by the click
 * in hand): on a rapid second click `leaving` is the first ripple's theme, but the
 * page UNDER the whole wave is still the original one. Without this the live page
 * would flip on the second click of a fast double-click, in exactly the region the
 * first circle has not reached yet.
 */
let burstLeaving: Theme | null = null;
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

/**
 * ⚠️ A burst's identity. Every deferred callback (`scheduledDrop`, the cover
 * removal, the guard) captures the generation it was created for and returns
 * without touching the DOM if a newer burst has since started.
 *
 * Without this, the previous landing's `setTimeout` — armed 760 ms in advance —
 * fires into the NEXT burst and removes its ripples: the second click's circle
 * either vanishes mid-flight or appears to do nothing. Reproduced 2026-09-20 by
 * clicking 1800 ms after the first click, i.e. inside the landing tail.
 */
let burstGen = 0;

/**
 * True from the moment a landing has applied the theme until its cover layers are
 * gone. ⚠️ This is a state nothing else in the module modelled, and it is exactly
 * the window the second-click bug lived in: `pending` is already null and the root
 * is already the new theme, but the copies are still on screen, so the burst is
 * neither "live" nor "finished".
 */
let landingTail = false;
/** The pending drop/cover timers of the CURRENT generation, so a new burst can
 *  cancel them instead of inheriting them. */
let dropTimer = 0;
let coverTimer = 0;

/**
 * Is a burst in flight?
 *
 * ⚠️ Keyed on `pending`, NOT on `intentTheme()`. `intentTheme()` falls back to the
 * root, and during a burst the root is deliberately parked on `NEUTRAL_THEME`
 * (`holdRoot`), so asking it "is a burst running" answers "no" for a light→dark
 * burst — which is how the burst's own leaving-theme bookkeeping got skipped.
 */
function burstInFlight(): boolean {
  return pending !== null && ripples.length > 0;
}

/**
 * The theme the visitor is actually LOOKING AT.
 *
 * ⚠️ **Not `rootTheme()`, and that distinction is a real bug that shipped.** For
 * the length of a burst the root is parked on `NEUTRAL_THEME` (`dark`), so the
 * attribute says "dark" no matter what the page was showing before the click.
 * Any question of the form "did we just come from the light theme?" answered
 * from the attribute therefore answers *no* on every click — which is exactly
 * what happened to the starfield arrival: the fade was wired to
 * `next === "dark" && rootTheme() !== "dark"`, the second half was always false
 * during a burst, and the field cut in at full strength ("星空是突然刷新出来的").
 * It only ever ran on a load or a reduced-motion swap, which is where it was
 * originally measured.
 *
 * It is updated in `applyInstant` — the one place a theme actually lands — and
 * deliberately NOT by `setRoot`, which is also used for the parking.
 */
let visibleTheme: Theme = rootTheme();

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
 *
 * ⚠️ 1.7 s, and it must stay over a second: the visitor asked for "一两秒的平滑从深到浅的
 * 渐入", and a field of stars arriving over 1 s still reads as a cut because the
 * rest of the page is already lit when it starts.
 *
 * ⚠️⚠️ **This fade cannot be pre-run, and that is why the copies now linger.**
 *
 * Measured per frame on a light->dark click (2026-09-20): the landing frame dropped
 * the copies with the page already dark and the canvas at 0.85 for ONE frame, and
 * the next frame reset it to 0 to begin this fade — a dark page with no stars,
 * which is the "画面会闪一下黑" report.
 *
 * Two fixes were tried and MEASURED to fail:
 *   · a negative `animation-delay` — the class only goes on in the rAF after the
 *     swap, so the animation's start time is "now"; the delay merely begins it N ms
 *     in. Measured: 0.85 at the landing, then a DIP to 0.146 and a ramp back up.
 *   · firing the fade early, while the canvas is still `display: none` — **Chrome
 *     does not run animations on a `display: none` element**, so the fade still
 *     only begins once the canvas becomes visible, after the copies are gone.
 *
 * Nothing can pre-light the field, so the hand-off is covered instead: the landing
 * now fades the copies out over `COPY_FADE_MS` (see `landBurst`) while this fade
 * runs underneath. Do not shorten that fade without re-measuring the landing frame.
 */
const ARRIVE_MS = 1700;
/* ⚠️ The starfield's CSS animation itself is 1600 ms (`sfArrive`, global.css §10).
   That number only matters through `GUARD_MS`, which is a literal 3400 = 1500 +
   1600 + slack; if `sfArrive` is ever retimed, re-derive `GUARD_MS` from it. */

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

/**
 * Park the root for the length of a burst, and keep the LIVE page on `leaving`.
 *
 * ⚠️ The attribute has to come off `light` (see NEUTRAL_THEME) — but that alone
 * means the page the visitor is looking at renders the neutral DARK theme for the
 * whole reveal. On a dark→light click that is invisible (the outgoing theme IS
 * dark); on a light→dark click it is a whole theme change landing on the click
 * frame, and it used to be hidden only because a full-page BASE COPY of the light
 * page was laid over it — a copy that has never been rastered at that moment, so
 * its own first paint was what the visitor was actually waiting for
 * (2026-09-19: "light mode 切换 dark mode 时，会出现磁带盒先变黑，其次才是圆环覆盖整个
 * 画面，看起来没那么自然").
 *
 * The hold class is the trick `buildScope` already plays for the copies, pointed
 * at the live root instead: `:root.theme-hold-light { … }` re-states every
 * light-theme rule, so the page keeps rendering light while the attribute is
 * parked. No copy has to be rastered before the click can be shown, and the two
 * directions now behave identically.
 */
function holdRoot(leaving: Theme): void {
  const root = document.documentElement;
  root.classList.toggle(HOLD_CLASS, leaving === "light");
  setRoot(NEUTRAL_THEME);
  // The held page is the one on screen, so its colour-scheme has to agree with
  // what it looks like, not with the parked attribute.
  root.style.colorScheme = leaving;
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
  // ⚠️ `visibleTheme`, not `rootTheme()` — see the note on the variable. During a
  // burst the attribute is parked on the neutral theme, so reading it here always
  // says "dark" and the arrival below never fires.
  const cameFrom = visibleTheme;
  root.classList.add("theme-land");
  // ⚠️ The hold class MUST come off here: it is only ever a parking state, and
  // leaving it on would pin the page to the light overrides under a dark root.
  root.classList.remove(HOLD_CLASS);
  setRoot(next);
  persist(next);
  void root.offsetHeight; // flush style + layout while transitions are off
  root.classList.remove("theme-land");
  visibleTheme = next;

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

/**
 * The hold class: the light theme's rules, re-rooted on `<html>` itself.
 *
 * ⚠️ `holdRoot` needs the same re-emission `scopedSelector` does, but pointed at
 * the LIVE root instead of a copy — see the note there. Only the light-theme
 * overrides are collected: the bare `:root` block IS the neutral baseline and
 * must keep applying while the attribute is parked.
 */
const HOLD_CLASS = "theme-hold-light";
/** ⚠️ Quote-agnostic on purpose: the dev sheet writes `[data-theme="light"]` and
 *  the minified build writes `[data-theme=light]`. */
const HOLD_THEME_RE = /:root\[data-theme=["']?light["']?\]/;

function scopedSelector(selectorText: string): string {
  return selectorText.replace(ROOT_THEME_RE, `.${SCOPE_CLASS}$1`);
}

/** The same rule re-rooted on the hold class, or null when it is not one of the
 *  light-theme overrides.
 *
 *  ⚠️ **The descendant rules have to re-enter through `<body>`, and that is not
 *  cosmetic**: the reveal's copies are `<div class="theme-scope"><body>…` hung off
 *  `<html>` as SIBLINGS of the real body, so a bare `:root.theme-hold-light .x`
 *  would reach inside a dark copy and hand it the light overrides — the exact
 *  wrong-coloured-copy artefact `buildScope` exists to prevent (measured at mean
 *  |Δ| 107 before it did). `> body` puts the hold rules inside the live page only.
 *  The bare token block has no descendant, so it stays `:root.theme-hold-light`
 *  and is inherited; every copy re-declares its own tokens anyway. */
function holdSelector(selectorText: string): string | null {
  const parts: string[] = [];
  for (const one of selectorText.split(",")) {
    const m = HOLD_THEME_RE.exec(one);
    if (!m) continue;
    const head = `${one.slice(0, m.index)}:root.${HOLD_CLASS}`;
    const rest = one.slice(m.index + m[0].length).trim();
    if (!rest) parts.push(head);
    else if (/^body\b/.test(rest)) parts.push(`${head} > ${rest}`);
    else parts.push(`${head} > body ${rest}`);
  }
  return parts.length ? parts.join(",") : null;
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
      const held = holdSelector(rule.selectorText);
      if (held) out.push(`${held}{${rule.style.cssText}}`);
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

  warm = { ripple, builtFor: leaving, at: performance.now() };
  // An unused set must not sit in the document for ever.
  warmTimer = window.setTimeout(discardWarm, WARM_MS + 1500);
}

/** Called at the start of a click: hands over the warmed layer, or none. */
function claimWarm(leaving: Theme): { ripple: HTMLDivElement | null } {
  if (!warm || warm.builtFor !== leaving || performance.now() - warm.at > WARM_MS) {
    discardWarm();
    return { ripple: null };
  }
  const set = warm;
  warm = null;
  window.clearTimeout(warmTimer);
  warmTimer = 0;
  set.ripple.style.visibility = "";
  return { ripple: set.ripple };
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
  const all: (HTMLDivElement | null)[] = ripples.map((r) => r.el);
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

/**
 * How long the copies keep covering the page AFTER the theme has been applied.
 *
 * ⚠️ **Not zero, and this is the whole of fix (4).** The starfield canvases are
 * `display: none` in the light theme, so on the landing frame the live page is
 * already dark while the field has not painted yet — measured per frame: `theme
 * dark`, `bodyBg rgb(7,7,13)`, `sf opacity 0`, no copies. That IS the black flash.
 *
 * Neither a negative `animation-delay` nor arming the fade early can pre-light the
 * field (**Chrome does not run animations on a `display: none` element**), so the
 * hand-off is covered instead: the theme applies UNDER the copies, they are given
 * this long to let the field paint, and only then are they taken away.
 */
const COPY_FADE_MS = 700;

function dropLayers(): void {
  window.clearTimeout(guardTimer);
  guardTimer = 0;
  window.clearTimeout(dropTimer);
  dropTimer = 0;
  window.clearTimeout(coverTimer);
  coverTimer = 0;
  landingTail = false;
  unbindScroll();
  for (const r of ripples) r.el.remove();
  ripples = [];
  burstLeaving = null;
  posterCache = null;
  // ⚠️ The hold class is a PARKING state and must never outlive the burst. It was
  // missing here, so `html.theme-hold-light` could survive a completed burst and
  // pin the page to the light overrides under a dark root (measured: hold=1,
  // copies=0, theme=dark).
  document.documentElement.classList.remove(HOLD_CLASS);
}

/**
 * Hide the finished copies without a cascade fight.
 *
 * ⚠️ A `transition: opacity` here was measured as a NO-OP — the copy read back at
 * opacity 0 regardless, because these layers carry their own theme rules and the
 * landing also toggles `theme-land`. So the cover is removed by GEOMETRY:
 * `transition: none` plus a translate out of the viewport, which has one winner.
 * Optional, and skipped under reduced motion (nothing to cover there: the swap is
 * instant).
 */
function coverOff(): void {
  if (ripples.length === 0) return;
  for (const r of ripples) {
    r.el.style.transition = "none";
    r.el.style.transform = "translateY(-110%)";
  }
}

/** Close the burst: the theme applies first, and the copies keep covering the page
 *  for `COPY_FADE_MS` so the incoming starfield can paint before they go.
 *
 *  ⚠️ Both the theme application and the two timers are bound to `burstGen`. The
 *  theme is applied ONLY while the copies still cover the viewport — that is what
 *  makes the swap invisible — so doing it here and the removal later is correct;
 *  what was missing is that a superseded burst must not do either. */
function landBurst(): void {
  const final = pending;
  pending = null;

  if (final && !reducedMotion()) {
    landingTail = true;
    const gen = burstGen;
    applyInstant(final);
    coverTimer = window.setTimeout(() => {
      if (gen !== burstGen) return;        // a newer burst owns the screen now
      coverOff();
      dropTimer = window.setTimeout(() => {
        if (gen !== burstGen) return;
        dropLayers();
      }, 60);
    }, COPY_FADE_MS);
    return;
  }

  dropLayers();
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
  ripples = ripples.slice(index);

  if (ripples[ripples.length - 1] === entry) landBurst();
  else offsetClones();
}

/** A burst must never wedge. If the last ripple has not landed within the guard
 *  window, close the burst on the theme the clicks asked for. */
function armGuard(): void {
  window.clearTimeout(guardTimer);
  const gen = burstGen;
  guardTimer = window.setTimeout(() => {
    if (gen !== burstGen) return;
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

  // ⚠️ A click inside the PREVIOUS burst's landing tail starts a fresh burst:
  // the theme is already applied and on screen, so the old copies are just a cover
  // that has not faded yet, and inheriting its timers is what ate the click. Tear
  // the tail down first, then treat this as `first`.
  if (landingTail) {
    window.clearTimeout(coverTimer);
    window.clearTimeout(dropTimer);
    dropLayers();
  }

  const point = usableOrigin(origin) ?? buttonOrigin();
  const x = point.x;
  const y = point.y;
  const radius = cornerRadius(x, y);
  const first = !burstInFlight();
  // A new burst takes ownership: bump the generation so every callback armed by
  // the previous one becomes a no-op.
  if (first) {
    burstGen += 1;
    burstLeaving = leaving;
  }
  // One event's worth of head start, if a press provided it.
  const held = first ? claimWarm(leaving) : { ripple: null };

  try {
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

    // ⚠️ Order matters, and it is not the obvious one. The root is parked OFF the
    // incoming theme — `holdRoot` takes the attribute off `light` — because a
    // light root would hand its own theme rules to the dark copies underneath
    // (see NEUTRAL_THEME). The page behind the copies keeps showing the OUTGOING
    // theme, via the hold class when that theme is light, which is also what makes
    // the landing (`setRoot(final)`) a real swap rather than a no-op when the
    // burst ends on dark.
    holdRoot(burstLeaving ?? leaving);
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
