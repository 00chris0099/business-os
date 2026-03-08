import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await query(
            `SELECT id, email, name, role, is_primary_admin, created_at, updated_at 
       FROM system.users 
       WHERE company_id = $1
       ORDER BY created_at DESC`,
            [session.user.company_id]
        );

        return NextResponse.json(res.rows);
    } catch (error) {
        console.error("GET users error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admin or admin can create users
    if (session.user.role !== "super_admin" && session.user.role !== "admin") {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    try {
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Only primary admin can create another super_admin
        if (role === "super_admin" && !session.user.is_primary_admin) {
            return NextResponse.json({ error: "Only the primary administrator can create super admins" }, { status: 403 });
        }

        // Check if email already exists
        const emailCheck = await query("SELECT id FROM system.users WHERE email = $1", [email]);
        if (emailCheck.rowCount !== null && emailCheck.rowCount > 0) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const insertRes = await query(
            `INSERT INTO system.users (company_id, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [session.user.company_id, email, passwordHash, name, role]
        );

        const newUserId = insertRes.rows[0].id;

        // Log user creation
        await query(
            `INSERT INTO system.audit_logs (company_id, user_id, action, entity, resource_id) 
       VALUES ($1, $2, 'create_user', 'user', $3)`,
            [session.user.company_id, session.user.id, newUserId]
        );

        return NextResponse.json({ message: "User created successfully", id: newUserId }, { status: 201 });
    } catch (error) {
        console.error("POST user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
