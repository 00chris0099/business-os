import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("company_id") || "00000000-0000-0000-0000-000000000001";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    try {
        let whereClause = `WHERE p.company_id = $1`;
        const params: (string | number)[] = [companyId];
        let paramIndex = 2;

        if (search) {
            whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        const countResult = await query(`SELECT COUNT(*) FROM erp.products p ${whereClause}`, params);

        const result = await query(
            `SELECT p.*, COALESCE(i.quantity, 0) as stock_quantity, COALESCE(i.reorder_level, 0) as reorder_level
       FROM erp.products p
       LEFT JOIN erp.inventory i ON p.id = i.product_id AND i.location = 'main'
       ${whereClause}
       ORDER BY p.created_at DESC
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
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            company_id = "00000000-0000-0000-0000-000000000001",
            sku, name, description, category, unit_price = 0,
            cost_price = 0, currency = "USD", unit_of_measure = "unit"
        } = body;

        const result = await query(
            `INSERT INTO erp.products (company_id, sku, name, description, category, unit_price, cost_price, currency, unit_of_measure)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [company_id, sku, name, description, category, unit_price, cost_price, currency, unit_of_measure]
        );

        return NextResponse.json({ data: result.rows[0] }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
