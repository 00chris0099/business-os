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
        let whereClause = `WHERE c.company_id = $1`;
        const params: (string | number)[] = [companyId];
        let paramIndex = 2;

        if (search) {
            whereClause += ` AND (c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            whereClause += ` AND c.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        const countResult = await query(
            `SELECT COUNT(*) FROM crm.clients c ${whereClause}`,
            params
        );

        const result = await query(
            `SELECT c.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM crm.clients c
       LEFT JOIN system.users u ON c.assigned_to = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
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
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            company_id = "00000000-0000-0000-0000-000000000001",
            name, email, phone, address, city, country,
            industry, website, status = "active", tags = []
        } = body;

        const result = await query(
            `INSERT INTO crm.clients (company_id, name, email, phone, address, city, country, industry, website, status, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [company_id, name, email, phone, address, city, country, industry, website, status, tags]
        );

        return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
