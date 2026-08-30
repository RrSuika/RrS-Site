import type { CollectionEntry } from "astro:content";

export type Language = "en" | "zh" | "nl";

export const defaultLanguage: Language = "en";

/** hreflang / og:locale code per language */
export const languageCodes: Record<Language, string> = {
  en: "en",
  zh: "zh-CN",
  nl: "nl-NL",
};

/** og:locale value per language */
export const languageLocales: Record<Language, string> = {
  en: "en_US",
  zh: "zh_CN",
  nl: "nl_NL",
};

/** date.toLocaleDateString locale per language */
export const languageDateLocales: Record<Language, string> = {
  en: "en-US",
  zh: "zh-CN",
  nl: "nl-NL",
};

/**
 * Get the current language from the URL.
 *
 * /lab
 * /projects
 * /lab/project
 *       → en
 *
 * /nl/lab
 * /nl/projects
 * /nl/lab/project
 *       → nl
 *
 * /zh/lab
 * /zh/projects
 * /zh/lab/project
 *       → zh
 */
export function getLanguageFromPath(
  pathname: string
): Language {
  if (pathname === "/nl" || pathname.startsWith("/nl/")) {
    return "nl";
  }

  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    return "zh";
  }

  return "en";
}

/**
 * Convert an existing path to another language.
 *
 * /lab/project
 *      → /zh/lab/project  ·  /nl/lab/project
 *
 * /zh/lab/project
 *      → /lab/project
 */
export function getLocalizedPath(
  pathname: string,
  language: Language
): string {
  let cleanPath =
    pathname.replace(/^\/(?:zh|nl)(?:\/|$)/, "/") || "/";

  // Site-wide convention: every page URL ends with a trailing slash
  // (Cloudflare Pages 308-redirects the slashless form, which breaks
  // canonical/hreflang consistency — see astro.config.mjs).
  if (cleanPath !== "/" && !cleanPath.endsWith("/")) {
    cleanPath += "/";
  }

  if (language === "en") {
    return cleanPath;
  }

  return `/${language}${cleanPath}`;
}

/**
 * Find another language version of the same project.
 *
 * Projects are connected through translationKey.
 */
export function findTranslation(
  entries: CollectionEntry<"entries">[],
  project: CollectionEntry<"entries">,
  language: Language
) {
  return entries.find(
    (entry) =>
      entry.data.translationKey ===
        project.data.translationKey &&
      entry.data.lang === language
  );
}
