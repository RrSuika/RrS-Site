function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "content-type": "application/json; charset=UTF-8",
            "cache-control": "no-store",
        },
    });
}

export async function onRequestGet(context) {
    try {
        const result = await context.env.DB
            .prepare(
                `
        SELECT count
        FROM nudge_count
        WHERE id = 1
        `,
            )
            .first();

        return json({
            success: true,
            count: Number(result?.count ?? 0),
        });
    } catch (error) {
        console.error("Nudge GET failed:", error);

        return json(
            {
                success: false,
                error: "Failed to read nudge count",
            },
            500,
        );
    }
}

export async function onRequestPost(context) {
    try {
        /**
         * ⚠️ UPSERT, not `UPDATE`. The first version ran
         * `UPDATE nudge_count SET count = count + 1 WHERE id = 1`, which is a
         * silent no-op when the row does not exist — a fresh database (or one
         * where the seed row was never inserted) answered `success: true,
         * count: 0` for ever, and the button looked broken with nothing in the
         * logs. `visit.js` already upserts; the two endpoints now match. It is
         * also one statement instead of two.
         */
        const result = await context.env.DB
            .prepare(
                `
        INSERT INTO nudge_count (id, count)
        VALUES (1, 1)
        ON CONFLICT(id) DO UPDATE SET count = nudge_count.count + 1
        RETURNING count
        `,
            )
            .first();

        return json({
            success: true,
            count: Number(result?.count ?? 0),
        });
    } catch (error) {
        console.error("Nudge POST failed:", error);

        return json(
            {
                success: false,
                error: "Failed to update nudge count",
            },
            500,
        );
    }
}