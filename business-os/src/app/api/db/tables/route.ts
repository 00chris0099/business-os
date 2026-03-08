import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const schema = searchParams.get("schema") || "public";

    try {
        const tables = await query(`
      SELECT 
        t.table_name,
        t.table_schema,
        pg_size_pretty(pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"')) AS size,
        (SELECT COUNT(*) FROM information_schema.columns c 
         WHERE c.table_name = t.table_name AND c.table_schema = t.table_schema) AS column_count
      FROM information_schema.tables t
      WHERE t.table_schema = $1 AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `, [schema]);

        return NextResponse.json({ data: tables.rows });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
    }
}
