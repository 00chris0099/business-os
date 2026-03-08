import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { email, message } = await req.json();

        if (!email || !message) {
            return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
        }

        // Insert support request into database
        await query(
            "INSERT INTO system.support_requests (email, message) VALUES ($1, $2)",
            [email, message]
        );

        // Optional: Add logic to notify Super Admin via email or internal alert system here
        console.log(`[SUPPORT REQUEST] New request from ${email}: ${message}`);

        return NextResponse.json({ message: "Administrator contacted successfully. We will follow up soon." }, { status: 201 });
    } catch (error) {
        console.error("Support API error:", error);
        return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }
}
