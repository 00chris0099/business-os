import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, role } = await req.json();
        const id = (await params).id;

        if (!name || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Identify target user
        const targetUserRes = await query("SELECT id, is_primary_admin, company_id FROM system.users WHERE id = $1", [id]);
        const targetUser = targetUserRes.rows[0];

        if (!targetUser || targetUser.company_id !== session.user.company_id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Primary admin protection
        if (targetUser.is_primary_admin) {
            // Only the primary admin can modify their own account
            if (session.user.id !== id) {
                return NextResponse.json({ error: "Cannot modify the primary super administrator" }, { status: 403 });
            }
            // Cannot have role changed
            if (role !== "super_admin") {
                return NextResponse.json({ error: "Primary super administrator role cannot be changed" }, { status: 403 });
            }
        } else {
            // Regular admin/super_admin modification permissions
            if (session.user.role !== "super_admin" && session.user.role !== "admin") {
                return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
            }
            if (role === "super_admin" && !session.user.is_primary_admin) {
                return NextResponse.json({ error: "Only the primary super administrator can grant super_admin" }, { status: 403 });
            }
        }

        await query(
            "UPDATE system.users SET name = $1, role = $2, updated_at = NOW() WHERE id = $3",
            [name, role, id]
        );

        // Audit Log
        await query(
            `INSERT INTO system.audit_logs (company_id, user_id, action, entity, resource_id) 
       VALUES ($1, $2, 'update_user', 'user', $3)`,
            [session.user.company_id, session.user.id, id]
        );

        return NextResponse.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("PUT user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    try {
        const targetUserRes = await query("SELECT is_primary_admin, company_id FROM system.users WHERE id = $1", [id]);
        const targetUser = targetUserRes.rows[0];

        if (!targetUser || targetUser.company_id !== session.user.company_id) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (targetUser.is_primary_admin) {
            return NextResponse.json({ error: "The primary supervisor administrator cannot be deleted" }, { status: 403 });
        }

        if (session.user.role !== "super_admin" && session.user.role !== "admin") {
            return NextResponse.json({ error: "Insufficient permissions to delete users" }, { status: 403 });
        }

        await query("DELETE FROM system.users WHERE id = $1", [id]);

        // Audit log
        await query(
            `INSERT INTO system.audit_logs (company_id, user_id, action, entity, resource_id) 
       VALUES ($1, $2, 'delete_user', 'user', $3)`,
            [session.user.company_id, session.user.id, id]
        );

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("DELETE user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
