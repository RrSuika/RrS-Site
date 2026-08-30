import type { Language } from "./i18n";

/**
 * Single source of truth for entry-type → URL-route mapping.
 *
 * Note the deliberate singular "note" — entry detail pages live at
 * `/note/{slug}` while the listing page is `/notes`. A previous
 * divergent copy of this map generated `/notes/{slug}` 404 links.
 */
export const typeToRoute: Record<string, string> = {
  projects: "projects",
  lab: "lab",
  note: "note",
  art: "art",
};

/**
 * Build the URL of an entry's detail page in a given language.
 *
 * `/projects/foo` (en) · `/zh/projects/foo` (zh)
 */
export function buildEntryUrl(
  entry: { id: string; data: { type: string } },
  language: Language,
): string {
  const slug = entry.id.split("/")[0];
  const route = typeToRoute[entry.data.type] ?? entry.data.type;
  const base = language === "en" ? `/${route}` : `/${language}/${route}`;
  // Trailing slash convention — see getLocalizedPath / astro.config.mjs.
  return `${base}/${slug}/`;
}
