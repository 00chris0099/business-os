import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("company_id") || "00000000-0000-0000-0000-000000000001";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    try {
        let whereClause = `WHERE o.company_id = $1`;
        const params: (string | number)[] = [companyId];
        let paramIndex = 2;

        if (status) {
            whereClause += ` AND o.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        const countResult = await query(`SELECT COUNT(*) FROM erp.orders o ${whereClause}`, params);

        const result = await query(
            `SELECT o.*, c.name as client_name, s.name as supplier_name
       FROM erp.orders o
       LEFT JOIN crm.clients c ON o.client_id = c.id
       LEFT JOIN erp.suppliers s ON o.supplier_id = s.id
       ${whereClause}
       ORDER BY o.created_at DESC
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
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            company_id = "00000000-0000-0000-0000-000000000001",
            order_number, type = "sale", client_id, status = "draft",
            subtotal = 0, tax_amount = 0, total = 0, currency = "USD", notes
        } = body;

        const orderNum = order_number || `ORD-${Date.now().toString(36).toUpperCase()}`;

        const result = await query(
            `INSERT INTO erp.orders (company_id, order_number, type, client_id, status, subtotal, tax_amount, total, currency, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [company_id, orderNum, type, client_id, status, subtotal, tax_amount, total, currency, notes]
        );

        return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
