import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const result = await query(
            `SELECT c.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM crm.clients c
       LEFT JOIN system.users u ON c.assigned_to = u.id
       WHERE c.id = $1`,
            [id]
        );
        if (!result.rows.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });
        return NextResponse.json({ data: result.rows[0] });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, email, phone, address, city, country, industry, website, status, tags } = body;

        const result = await query(
            `UPDATE crm.clients SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        country = COALESCE($6, country),
        industry = COALESCE($7, industry),
        website = COALESCE($8, website),
        status = COALESCE($9, status),
        tags = COALESCE($10, tags),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
            [name, email, phone, address, city, country, industry, website, status, tags, id]
        );

        if (!result.rows.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });
        return NextResponse.json({ data: result.rows[0] });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await query(`DELETE FROM crm.clients WHERE id = $1`, [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
