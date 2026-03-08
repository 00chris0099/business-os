import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const schema = searchParams.get("schema") || "public";
    const table = searchParams.get("table") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    if (!table) {
        return NextResponse.json({ error: "Table name required" }, { status: 400 });
    }

    // Validate identifiers to prevent SQL injection
    const safeSchema = schema.replace(/[^a-zA-Z0-9_]/g, '');
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');

    try {
        // Get columns
        const columns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [safeSchema, safeTable]);

        // Get data
        const countResult = await query(
            `SELECT COUNT(*) FROM "${safeSchema}"."${safeTable}"`
        );

        const dataResult = await query(
            `SELECT * FROM "${safeSchema}"."${safeTable}" 
       ORDER BY 1 DESC
       LIMIT ${limit} OFFSET ${offset}`
        );

        return NextResponse.json({
            data: dataResult.rows,
            columns: columns.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: `Failed to fetch data from ${schema}.${table}` }, { status: 500 });
    }
}
