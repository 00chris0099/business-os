import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Token and new password required" }, { status: 400 });
        }

        // Verify token exists and is valid
        const resetRes = await query(
            "SELECT user_id, expires_at FROM system.password_resets WHERE token = $1",
            [token]
        );

        if (resetRes.rowCount === 0) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const { user_id, expires_at } = resetRes.rows[0];

        // Check expiration
        if (new Date() > new Date(expires_at)) {
            await query("DELETE FROM system.password_resets WHERE token = $1", [token]);
            return NextResponse.json({ error: "Token has expired" }, { status: 400 });
        }

        // Hash the new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update user password and log action
        await query("BEGIN");

        await query("UPDATE system.users SET password_hash = $1 WHERE id = $2", [passwordHash, user_id]);
        await query("DELETE FROM system.password_resets WHERE user_id = $2", [token, user_id]);

        // Log password reset action
        const userCompanyRes = await query("SELECT company_id FROM system.users WHERE id = $1", [user_id]);
        if (userCompanyRes.rowCount && userCompanyRes.rowCount > 0) {
            await query(
                `INSERT INTO system.audit_logs (company_id, user_id, action, entity) VALUES ($1, $2, 'password_reset', 'user')`,
                [userCompanyRes.rows[0].company_id, user_id]
            );
        }

        await query("COMMIT");

        return NextResponse.json({ message: "Password has been successfully reset" });
    } catch (error) {
        console.error("Reset password error:", error);
        await query("ROLLBACK");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
