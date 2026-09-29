function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "content-type": "application/json; charset=UTF-8",
            "cache-control": "no-store",
        },
    });
}

/**
 * Normalize URL paths so:
 *
 * /lab/
 * /lab
 *
 * are counted as the same page.
 */
function normalizePath(pathname) {
    if (!pathname || pathname === "/") {
        return "/";
    }

    return pathname.replace(/\/+$/, "");
}

/**
 * Fan pages are kept as a separate section.
 *
 * Covers:
 *   /fan
 *   /zh/fan
 *   /nl/fan
 *
 * And future sub-pages such as:
 *   /fan/gallery
 *   /zh/fan/gallery
 */
function getSection(path) {
    if (
        path === "/fan" ||
        path.startsWith("/fan/") ||
        path === "/zh/fan" ||
        path.startsWith("/zh/fan/") ||
        path === "/nl/fan" ||
        path.startsWith("/nl/fan/")
    ) {
        return "fan";
    }

    return "main";
}

export async function onRequestPost(context) {
    try {
        /**
         * The frontend sends:
         *
         * {
         *   "path": "/lab/test"
         * }
         *
         * Read the path from the request body rather than from
         * context.request.url, which would only give us /api/visit.
         */
        const body = await context.request.json();
        const path = normalizePath(body?.path);

        if (!path || !path.startsWith("/")) {
            return json(
                {
                    success: false,
                    error: "Invalid path",
                },
                400,
            );
        }

        const section = getSection(path);

        /**
         * Insert a new page when it does not exist.
         * Increment the existing counter when it does.
         *
         * `path` is the PRIMARY KEY, so each URL has its own counter.
         */
        await context.env.DB.prepare(
            `
      INSERT INTO page_views (path, section, views)
      VALUES (?, ?, 1)
      ON CONFLICT(path)
      DO UPDATE SET views = page_views.views + 1
      `,
        )
            .bind(path, section)
            .run();

        return json({
            success: true,
            path,
            section,
        });
    } catch (error) {
        console.error("Page view tracking failed:", error);

        return json(
            {
                success: false,
                error: "Failed to record page view",
            },
            500,
        );
    }
}

/**
 * GET /api/visit
 *
 * Returns all page counters.
 */
export async function onRequestGet(context) {
    try {
        const result = await context.env.DB.prepare(
            `
      SELECT path, section, views
      FROM page_views
      ORDER BY section, views DESC
      `,
        ).all();

        return json({
            success: true,
            pages: result.results ?? [],
        });
    } catch (error) {
        console.error("Page view read failed:", error);

        return json(
            {
                success: false,
                error: "Failed to read page views",
            },
            500,
        );
    }
}