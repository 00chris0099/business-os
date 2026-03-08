import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// List all schemas
export async function GET() {
    try {
        const schemas = await query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schema_name
    `);

        return NextResponse.json({ data: schemas.rows });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch schemas" }, { status: 500 });
    }
}
