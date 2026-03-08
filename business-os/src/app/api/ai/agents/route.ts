import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("company_id") || "00000000-0000-0000-0000-000000000001";

    try {
        const result = await query(
            `SELECT * FROM ai.ai_agents WHERE company_id = $1 ORDER BY created_at DESC`,
            [companyId]
        );
        return NextResponse.json({ data: result.rows });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch AI agents" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            company_id = "00000000-0000-0000-0000-000000000001",
            name, description, type = "assistant", model = "gpt-4o",
            system_prompt, temperature = 0.7, max_tokens = 2000, capabilities = []
        } = body;

        const result = await query(
            `INSERT INTO ai.ai_agents (company_id, name, description, type, model, system_prompt, temperature, max_tokens, capabilities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [company_id, name, description, type, model, system_prompt, temperature, max_tokens, capabilities]
        );

        return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create AI agent" }, { status: 500 });
    }
}
