import type { ImageMetadata } from "astro";

const entryImages = import.meta.glob(
  "/src/content/entries/**/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  },
);

// Legacy fallback: originals kept in `输入/`. The prepare-images script copies
// optimized WebP copies into the entry folder; these globs keep the page
// rendering until that script has been run.
const inputImages = import.meta.glob(
  [
    "/输入/Cover.png",
    "/输入/V1 1.png",
    "/输入/V1 2.png",
    "/输入/V1 3.png",
    "/输入/V2.png",
    "/输入/V3.png",
  ],
  {
    eager: true,
    import: "default",
  },
);

// Frontmatter uses the prepared WebP names; until the one-time prepare script
// has run, keep a fallback to the original files in `输入/`.
const inputImageAliases: Record<string, string> = {
  "cover.webp": "Cover.png",
  "v1-1.webp": "V1 1.png",
  "v1-2.webp": "V1 2.png",
  "v1-3.webp": "V1 3.png",
  "v2.webp": "V2.png",
  "v3.webp": "V3.png",
};



export type ProjectImage = ImageMetadata | string;

/**
 * Resolve a content image to its Astro ImageMetadata object (or a plain
 * URL for the public/ fallbacks). Use this when the consumer wants to
 * hand the image to `astro:assets` for optimized output.
 */
export function getProjectImageMeta(
  id: string,
  filename: string,
): ProjectImage | null {
  // Fashion-design PNGs are served raw from /public to preserve alpha.
  if (id === "fashion-design" && filename.endsWith(".png")) {
    return `/art/fashion-design/${filename}`;
  }

  const entryKey = Object.keys(entryImages).find(
    (path) =>
      path.includes(`/entries/${id}/`) &&
      path.endsWith(filename),
  );

  const inputFilename = inputImageAliases[filename] ?? filename;

  const inputKey = Object.keys(inputImages).find((path) =>
    decodeURIComponent(path).replace(/\\/g, "/").endsWith(`/输入/${inputFilename}`),
  );

  if (entryKey) {
    return entryImages[entryKey] as ProjectImage;
    // entry image already returned above
  }

  if (!inputKey) {
    console.warn("Image not found:", id, filename);
    return null;
  }

  return inputImages[inputKey] as ProjectImage;
}

/**
 * Compatibility accessor for callers that only need the raw resolved
 * value (Astro image globs yield ImageMetadata objects at runtime).
 */
export function getProjectImage(
  id: string,
  filename: string,
): ProjectImage | null {
  return getProjectImageMeta(id, filename);
}

/**
 * Always returns the final URL string for plain <img> rendering.
 */
export function getProjectImageUrl(
  id: string,
  filename: string,
): string | null {
  const raw = getProjectImageMeta(id, filename);

  if (!raw) return null;
  return typeof raw === "string" ? raw : String(raw.src);
}
