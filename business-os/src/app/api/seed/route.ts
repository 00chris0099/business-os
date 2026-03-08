import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
        const sql = fs.readFileSync(schemaPath, "utf8");
        await query(sql);
        return NextResponse.json({ message: "Schema executed successfully" });
    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: error.message || "Failed to seed" }, { status: 500 });
    }
}
