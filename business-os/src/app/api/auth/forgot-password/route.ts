import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        const userRes = await query("SELECT id FROM system.users WHERE email = $1", [email]);
        if (userRes.rowCount === 0) {
            // Return success even if not found to prevent email enumeration
            return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
        }

        const userId = userRes.rows[0].id;

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store token
        await query(
            "INSERT INTO system.password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [userId, token, expiresAt]
        );

        // Simulate sending email (in a real app, integrate Resend/SendGrid/etc.)
        console.log(`[EMAIL DISPATCH] Password Reset for ${email}`);
        console.log(`Reset Link: http://localhost:3000/reset-password?token=${token}`);

        return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
