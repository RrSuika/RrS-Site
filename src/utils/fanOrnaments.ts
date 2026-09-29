/**
 * The fan page's motif set: the reference deck's decoration vocabulary, as bare
 * path data. No asset to fetch, nothing to block on.
 *
 * ⚠️ Lives in `src/utils/` because it is page data rather than component-local: the
 * hero's scatter in `FanPage.astro` is built from it, and the cloud silhouette below
 * is what that hero draws. (The arrival animation drew from the icon sheet too, until
 * it was replaced by a canvas port on 2026-09-30 — see `docs/fan-page.md` §十九.)
 *
 * ⚠️ EVERY coordinate must stay inside the `0 0 24 24` box. The old `curl` ran to
 * 26 and shipped with one side sliced off, which is exactly the kind of bug a
 * viewBox hides.
 *
 * `stroke: true` means the path is a LINE to be drawn, not a shape to be filled —
 * a consumer that fills everything will paint `squiggle` as a black slab.
 */
export const ORN_PATHS: Record<string, { d: string; stroke?: boolean }> = {
  // the reference's dominant motif: a four-point sparkle with concave sides
  sparkle: { d: "M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z" },
  // the chunky star
  star: { d: "M12 2 L14.6 9.4 L22 12 L14.6 14.6 L12 22 L9.4 14.6 L2 12 L9.4 9.4 Z" },
  // a small round dot, which is what the reference scatters between the sparkles
  dot: { d: "M12 4 a8 8 0 1 1 0 16 a8 8 0 1 1 0 -16 z" },
  // heart
  heart: { d: "M12 21 C4 15 2 11 4 7.5 A5 5 0 0 1 12 5.5 A5 5 0 0 1 20 7.5 C22 11 20 15 12 21 Z" },
  // sun: a disc with eight rays
  sun: { d: "M12 7 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10 z M12 1 v3 M12 20 v3 M1 12 h3 M20 12 h3 M4.2 4.2 l2.1 2.1 M17.7 17.7 l2.1 2.1 M19.8 4.2 l-2.1 2.1 M6.3 17.7 l-2.1 2.1" },
  // cloud
  cloud: { d: "M6 18 a4 4 0 0 1 0 -8 a5 5 0 0 1 9.5 -1.5 a4.5 4.5 0 0 1 2.5 9.5 z" },
  // rainbow: three nested arcs, drawn as strokes
  rainbow: { d: "M3 19 a9 9 0 0 1 18 0 M6.5 19 a5.5 5.5 0 0 1 11 0 M10 19 a2 2 0 0 1 4 0", stroke: true },
  // bubble: a ring with a highlight
  bubble: { d: "M12 3 a9 9 0 1 1 0 18 a9 9 0 1 1 0 -18 z M8.5 8.5 a5 5 0 0 1 5 -2", stroke: true },
  // the squiggle, kept inside the box this time
  squiggle: { d: "M2 15 C5 8 8 8 11 15 C14 22 17 22 22 12", stroke: true },
  // a curled ribbon, also inside the box
  curl: { d: "M4 19 C4 10 14 10 14 17 C14 21 9 21 9 17.5 C9 15 14 15 17 12 C19 10 21 7 22 5", stroke: true },
  // the studio's own crown, the one motif the reference sheet repeats most
  crown: { d: "M3 18 L3 8 L8.2 11.6 L12 3.4 L15.8 11.6 L21 8 L21 18 Z", stroke: false },
};

/**
 * The scalloped cloud silhouette, in the hero's own `0 0 242 242` square box.
 *
 * ⚠️ ONE closed path and every arc is `a r r 0 0 1 dx 0`, so each scallop is a
 * half circle by construction. It is the silhouette the hero's `.hero-blob` cloud
 * is drawn from, and it is shared so nothing has to re-derive it.
 *
 * ⚠️ `fill-rule: evenodd` is what makes the centre a HOLE (the hero wants that: the
 * white middle is the page showing through). A consumer that wants a SOLID cloud
 * draws the same `d` with the default non-zero rule — same outline, opposite
 * interior, and that difference is on purpose.
 *
 * The silhouette spans x 22..220, y 47..183 inside the box; the slack around it is
 * why a consumer that wants a tight fit uses its own viewBox.
 */
export const CLOUD_BODY_D =
  "M36 152 a28 28 0 0 1 6 -54 a32 32 0 0 1 46 -30 a40 40 0 0 1 66 0 a32 32 0 0 1 46 30 a28 28 0 0 1 6 54 a22 22 0 0 1 -30 6 a26 26 0 0 1 -40 0 a26 26 0 0 1 -40 0 a22 22 0 0 1 -30 -6 z";

/** The cloud's tight box: `x y w h` of the silhouette inside `0 0 242 242`. */
export const CLOUD_BOX = "22 47 198 136";
