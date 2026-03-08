import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("company_id") || "00000000-0000-0000-0000-000000000001";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    try {
        let whereClause = `WHERE l.company_id = $1`;
        const params: (string | number)[] = [companyId];
        let paramIndex = 2;

        if (search) {
            whereClause += ` AND (l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            whereClause += ` AND l.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        const countResult = await query(`SELECT COUNT(*) FROM crm.leads l ${whereClause}`, params);

        const result = await query(
            `SELECT l.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM crm.leads l
       LEFT JOIN system.users u ON l.assigned_to = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );

        return NextResponse.json({
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            company_id = "00000000-0000-0000-0000-000000000001",
            name, email, phone, source, status = "new",
            score = 0, estimated_value, notes
        } = body;

        const result = await query(
            `INSERT INTO crm.leads (company_id, name, email, phone, source, status, score, estimated_value, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [company_id, name, email, phone, source, status, score, estimated_value, notes]
        );

        return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }
}
