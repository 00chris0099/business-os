import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("company_id") || "00000000-0000-0000-0000-000000000001";

    try {
        const result = await query(
            `SELECT * FROM automation.workflows WHERE company_id = $1 ORDER BY created_at DESC`,
            [companyId]
        );
        return NextResponse.json({ data: result.rows });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            company_id = "00000000-0000-0000-0000-000000000001",
            name, description, n8n_workflow_id, trigger_type, tags = []
        } = body;

        const result = await query(
            `INSERT INTO automation.workflows (company_id, name, description, n8n_workflow_id, trigger_type, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [company_id, name, description, n8n_workflow_id, trigger_type, tags]
        );

        return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
    }
}
