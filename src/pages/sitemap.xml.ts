import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * Build-time sitemap endpoint — no integration dependency.
 * Art entries are excluded: they have no detail pages by design.
 */
export const GET: APIRoute = async ({ site }) => {
  const entries = await getCollection("entries");

  const base = (site?.href ?? "https://rrsuika-studio.pages.dev").replace(/\/$/, "");

  const staticPaths = ["", "/projects", "/lab", "/notes", "/about", "/art"];

  const urls = new Map<string, string>(); // url → optional lastmod

  for (const path of staticPaths) {
    // Trailing-slash convention: site-wide URLs end with "/" (see astro.config.mjs).
    urls.set(`${base}${path}/`, "");
    urls.set(`${base}/zh${path}/`, "");
    urls.set(`${base}/nl${path}/`, "");
  }

  for (const entry of entries) {
    if (entry.data.type === "art") continue;

    const slug = entry.id.split("/")[0];
    const lastmod = entry.data.date.toISOString().slice(0, 10);
    const prefix = entry.data.lang === "en" ? "" : `/${entry.data.lang}`;

    urls.set(`${base}${prefix}/${entry.data.type}/${slug}/`, lastmod);
  }

  const body = [...urls.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([url, lastmod]) =>
        `  <url>\n    <loc>${url}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    {
      headers: { "Content-Type": "application/xml" },
    },
  );
};
