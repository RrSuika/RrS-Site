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
        await context.env.DB
            .prepare(
                `
        UPDATE nudge_count
        SET count = count + 1
        WHERE id = 1
        `,
            )
            .run();

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