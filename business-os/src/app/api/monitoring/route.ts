import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import os from "os";

export async function GET() {
    try {
        const [dbSize, connections, tableStats] = await Promise.all([
            query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size, 
              pg_database_size(current_database()) as size_bytes`),
            query(`SELECT count(*) as total, 
              sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active,
              sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END) as idle
             FROM pg_stat_activity WHERE datname = current_database()`),
            query(`SELECT schemaname, tablename, n_live_tup as row_count,
              pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
             FROM pg_stat_user_tables
             ORDER BY n_live_tup DESC
             LIMIT 10`),
        ]);

        // System metrics
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const cpuCount = os.cpus().length;
        const loadAvg = os.loadavg();
        const uptime = os.uptime();

        return NextResponse.json({
            database: {
                size: dbSize.rows[0]?.size,
                size_bytes: parseInt(dbSize.rows[0]?.size_bytes || '0'),
                connections: {
                    total: parseInt(connections.rows[0]?.total || '0'),
                    active: parseInt(connections.rows[0]?.active || '0'),
                    idle: parseInt(connections.rows[0]?.idle || '0'),
                },
                top_tables: tableStats.rows,
            },
            system: {
                memory: {
                    total: totalMem,
                    free: freeMem,
                    used: totalMem - freeMem,
                    percent: Math.round(((totalMem - freeMem) / totalMem) * 100),
                },
                cpu: {
                    count: cpuCount,
                    load_avg_1m: loadAvg[0],
                    load_avg_5m: loadAvg[1],
                    load_avg_15m: loadAvg[2],
                },
                uptime_seconds: uptime,
                platform: os.platform(),
                node_version: process.version,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch system metrics" }, { status: 500 });
    }
}
