import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Server checks user in PostgreSQL
        const res = await query("SELECT * FROM system.users WHERE email = $1", [email]);
        const user = res.rows[0];

        if (!user) {
            return NextResponse.json({ error: "Correo electrónico o contraseña no válidos" }, { status: 401 });
        }

        // Password is verified using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Correo electrónico o contraseña no válidos" }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                company_id: user.company_id,
                is_primary_admin: user.is_primary_admin
            },
            process.env.NEXTAUTH_SECRET || "fallback_secret",
            { expiresIn: "30d" }
        );

        // Create response with secure session cookie
        // If valid, redirect user to the dashboard
        const response = NextResponse.json({ message: "Login successful", redirect: "/" }, { status: 200 });

        // Set HTTP cookie
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return response;
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
