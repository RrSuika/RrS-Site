/**
 * Scroll reveal — content entering the viewport.
 *
 * The site had motion in exactly two places (the cassette shelf and the theme
 * reveal) and then nothing: scrolling the home page, a listing or a project
 * detail page was completely static. This is the shared mechanism for the rest,
 * so the entrance is defined once instead of per page.
 *
 * ⚠️ **The hooks are added by this module, never present in the markup.** The
 * hidden state lives behind `html.js-reveal` (global.css §17), so if this file
 * fails to load, is blocked, or the visitor has JS off, nothing is hidden and the
 * page renders normally. Marking elements in HTML and hiding them in CSS would
 * white-screen a no-JS visitor and flash the page for everyone else.
 *
 * ⚠️ **Marking an element opts it out of nothing** — the rule animates the
 * independent `translate`/`opacity` properties, so it composes with the
 * `transform` hover lifts rather than fighting them. See global.css §17.
 *
 * ⚠️ **There is deliberately NO "reveal everything after N ms" fallback.** There
 * was one (`setTimeout(…, 2500)`) and it silently disabled the entire feature:
 * measured on the production build, every card was already revealed 2.5 s after
 * load NO MATTER WHERE IT WAS, so content below the fold ran its entrance
 * off-screen and then simply appeared when scrolled to — the reveal only ever
 * worked for whatever was in view during the first 2.5 s. It was guarding against
 * "an element never gets an intersection callback", which is not a real failure
 * mode: IntersectionObserver fires for every observed target on the first frame
 * after `observe()` (reporting `isIntersecting: false` for the off-screen ones)
 * and again on every visibility change, so a target cannot be missed by merely
 * staying hidden. The genuinely no-observer case is the `if (!io)` branch in
 * `revealOn`, which reveals everything immediately.
 */

/** Elements already scheduled, so a second `revealOn` call cannot double-observe. */
const seen = new WeakSet<Element>();
let observer: IntersectionObserver | null = null;
let started = false;

/** How long the entrance runs, matching `--reveal-dur` in global.css §17. */
const EXIT_MS = 700;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * ⚠️ Astro's DEV server ships every page with the measurement scripts attached,
 * and a page that is blank until you scroll makes every screenshot and
 * computed-style audit a lie. Reveal-on-load in dev so the rendered result is
 * always fully materialised.
 */
function isDev(): boolean {
  return import.meta.env.DEV;
}

function show(el: HTMLElement): void {
  if (el.classList.contains("is-revealed")) return;
  el.classList.add("is-revealed");
  // Hand the element back to the rest of the stylesheet. The delay must outlast
  // the transition, or removing the attribute mid-flight would snap the element
  // to its final position and skip the animation.
  window.setTimeout(() => {
    el.removeAttribute("data-reveal");
  }, EXIT_MS);
}

function ensureObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === "undefined") return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target as HTMLElement);
        observer?.unobserve(entry.target);
      }
    },
    // Starts the entrance slightly before the element is on screen, so the
    // movement is already settling by the time it is properly in view.
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  );
  return observer;
}

/**
 * Mark everything in `root` matching `selector` for a staggered entrance.
 *
 * `step` is the per-item delay. The skill guidance is 30–80 ms; anything longer
 * makes the page feel slow to read, so the default sits in the middle.
 */
export function revealOn(
  root: ParentNode,
  selector: string,
  { step = 50 }: { step?: number } = {},
): void {
  const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (items.length === 0) return;

  if (isDev() || reducedMotion()) {
    // Nothing to observe: reveal immediately. Reduced motion still gets the
    // opacity fade (that aids comprehension); only the movement is dropped, which
    // global.css does by zeroing `--reveal-shift`.
    for (const el of items) el.classList.add("is-revealed");
    return;
  }

  for (const [i, el] of items.entries()) {
    if (seen.has(el)) continue;
    seen.add(el);
    el.setAttribute("data-reveal", "");
    // Cap the stagger: a long list would otherwise hold its last item back by
    // seconds, which reads as jank rather than as choreography.
    el.style.setProperty("--reveal-delay", `${Math.min(i, 8) * step}ms`);
  }

  const io = ensureObserver();
  if (!io) {
    for (const el of items) show(el);
    return;
  }
  for (const el of items) io.observe(el);
}

/**
 * The hook a container uses to register a staggered group without needing its own
 * script: `<div class="grid" data-reveal-group=".card">`. The value is the child
 * selector to reveal.
 */
const GROUP_ATTR = "data-reveal-group";

/** Per-group stagger override, e.g. `data-reveal-step="40"`. */
const STEP_ATTR = "data-reveal-step";

/** Set the hooks the CSS keys off, then register every declared group. */
export function initReveal(): void {
  if (started) return;
  started = true;
  document.documentElement.classList.add("js-reveal");

  for (const group of Array.from(document.querySelectorAll<HTMLElement>(`[${GROUP_ATTR}]`))) {
    const selector = group.getAttribute(GROUP_ATTR);
    if (!selector) continue;
    const raw = group.getAttribute(STEP_ATTR);
    const step = raw === null ? undefined : Number(raw);
    revealOn(group, selector, Number.isFinite(step) ? { step } : {});
  }
}
