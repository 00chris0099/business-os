import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sql } = body;

        if (!sql || typeof sql !== 'string') {
            return NextResponse.json({ error: "SQL query is required" }, { status: 400 });
        }

        // Block dangerous operations
        const dangerousPatterns = [/DROP\s+DATABASE/i, /DROP\s+SCHEMA.*CASCADE/i, /TRUNCATE.*pg_/i];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(sql)) {
                return NextResponse.json({ error: "This operation is not allowed" }, { status: 403 });
            }
        }

        const start = Date.now();
        const result = await query(sql);
        const duration = Date.now() - start;

        return NextResponse.json({
            data: result.rows,
            rowCount: result.rowCount,
            duration,
            command: result.command,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Query execution failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
