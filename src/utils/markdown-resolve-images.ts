/**
 * Sätteri raw-node plugin (Astro 7's default Markdown processor):
 * register `./filename` image references from RAW HTML blocks in entry
 * markdown with Astro's native content-image pipeline.
 *
 * Entry bodies contain two kinds of images:
 *  - Markdown syntax `![](./01.png)` — collected by Astro's mdast
 *    collect-images plugin and resolved to hashed `/_astro/*.webp` URLs
 *    by the internal image-marker + `updateImageReferencesInBody`
 *    pipeline. These already work.
 *  - Raw HTML `<img src="./04.png">` (step galleries, side-by-side
 *    blocks) — those blocks stay as raw nodes and are never visited as
 *    elements, so Astro's pipeline ignores them. The browser requests
 *    them relative to the page URL — e.g. `/projects/foo/04.png` —
 *    which 404s on every page load (Cloudflare 4xx report). A former
 *    client-side patch in ProjectDetail.astro was removed; this plugin
 *    replaces it.
 *
 * This plugin rewrites each raw `<img src="./…">` into an
 * `__ASTRO_IMAGE_` marker attribute — the exact format the internal
 * image-marker plugin emits — and adds the path to the shared
 * `ctx.data.astro.localImagePaths` bag. `updateImageReferencesInBody`
 * (astro:content render path) then resolves the marker to the real
 * optimized URL at page render time, so no URL resolution happens here.
 * (A former attempt to resolve via `images.ts` failed because plugins
 * are bundled with the config, whose module graph does not run
 * astro:assets processing — `.src` came back as the raw
 * `/src/content/...` path, which 404s in production.)
 *
 * Only images that actually exist next to the markdown file are
 * rewritten — checked against the lazy glob's keys (keys are plain
 * source paths, safe in the config bundle; values would materialize
 * broken ImageMetadata, so they are never touched). A missing reference
 * degrades to the old `./` behavior instead of breaking the build with
 * an unresolvable import.
 *
 * Registered via `markdown.processor: satteri({ hastPlugins: [...] })`
 * in astro.config.mjs.
 *
 * ⚠️ Content-layer cache: Astro persists rendered markdown in
 * `node_modules/.astro/data-store.json`, keyed by file digest only —
 * changing this plugin (or any markdown pipeline config) does NOT
 * invalidate it. Delete `node_modules/.astro` to force a re-render
 * locally. Cloudflare builds from a clean checkout, so deploys are
 * unaffected.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const ATTR_RE = /([a-zA-Z-]+)="([^"]*)"/g;

/** Existing entry images, as `{slug}/{filename}` pairs (lazy glob keys). */
const knownEntryImages = new Set(
  Object.keys(import.meta.glob("/src/content/entries/**/*.{png,jpg,jpeg,webp}")).map(
    (path) => {
      const segments = path.split("/").filter(Boolean);
      return `${segments[segments.length - 2]}/${segments[segments.length - 1]}`;
    },
  ),
);

/** HTML-escape a JSON string for use inside a double-quoted attribute. */
function escapeJsonAttr(obj: unknown): string {
  return JSON.stringify(obj).replace(/"/g, "&quot;");
}

export const resolveEntryImages = {
  name: "resolve-entry-images",
  raw(node: any, ctx: any) {
    const value = node.value;
    if (typeof value !== "string" || !value.includes("./")) return;
    if (!ctx.fileURL) return;

    // file:///…/src/content/entries/{slug}/en.md — both separators can occur.
    const slug = String(ctx.fileURL.pathname).match(
      /entries[\\/]([^\\/]+)[\\/]/,
    )?.[1];
    if (!slug) return;

    const indexBySrc = new Map<string, number>();

    const next = value.replace(IMG_TAG_RE, (tag) => {
      const src = tag.match(/\bsrc="([^"]*)"/)?.[1];
      if (!src || !src.startsWith("./")) return tag;

      const filename = src.replace(/^\.\//, "");
      if (!knownEntryImages.has(`${slug}/${filename}`)) return tag;

      // Keep remaining attributes (alt, title, …) for getImage.
      const props: Record<string, string> = {};
      let m: RegExpExecArray | null;
      while ((m = ATTR_RE.exec(tag)) !== null) {
        if (m[1] !== "src") props[m[1]] = m[2];
      }
      const index = indexBySrc.get(src) ?? 0;
      indexBySrc.set(src, index + 1);

      // Feed Astro's native pipeline: the marker attribute is resolved
      // by updateImageReferencesInBody at page render time.
      ctx.data.astro?.localImagePaths?.add(src);

      return `<img __ASTRO_IMAGE_="${escapeJsonAttr({ ...props, src, index })}" />`;
    });

    if (next !== value) ctx.setProperty(node, "value", next);
  },
};
