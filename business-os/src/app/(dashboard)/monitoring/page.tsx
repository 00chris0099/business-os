"use client";

import { useState, useEffect } from "react";
import {
    Server, Database, Cpu, HardDrive, Activity,
    RefreshCw, Wifi, CheckCircle2, AlertTriangle, Loader2,
    MemoryStick
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from "recharts";

interface SystemMetrics {
    database: {
        size: string;
        size_bytes: number;
        connections: { total: number; active: number; idle: number };
        top_tables: Array<{ schemaname: string; tablename: string; row_count: number; size: string }>;
    };
    system: {
        memory: { total: number; free: number; used: number; percent: number };
        cpu: { count: number; load_avg_1m: number; load_avg_5m: number; load_avg_15m: number };
        uptime_seconds: number;
        platform: string;
        node_version: string;
    };
    timestamp: string;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Generate simulated historical data
const generateHistory = (points = 20) =>
    Array.from({ length: points }, (_, i) => ({
        time: `${i}m ago`,
        cpu: Math.random() * 40 + 10,
        memory: Math.random() * 20 + 55,
        connections: Math.floor(Math.random() * 8 + 2),
    })).reverse();

export default function MonitoringPage() {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState(generateHistory());
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchMetrics = async () => {
        try {
            const res = await fetch("/api/monitoring");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMetrics(data);
            setLastUpdated(new Date());
            setError(null);
            // Append to history
            setHistory(prev => [
                ...prev.slice(-19),
                {
                    time: "now",
                    cpu: data.system.cpu.load_avg_1m * 10,
                    memory: data.system.memory.percent,
                    connections: data.database.connections.total,
                }
            ]);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to fetch metrics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-green-500/10 border-green-500/20">
                            <Server size={18} className="text-green-400" />
                        </span>
                        System Monitoring
                    </h1>
                    <p className="page-subtitle mt-1">
                        Real-time infrastructure health and performance
                        {lastUpdated && <span className="ml-2 text-muted-foreground">· Updated {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <button onClick={fetchMetrics} className="btn-secondary text-xs">
                    <RefreshCw size={12} /> Refresh
                </button>
            </div>

            {error && (
                <div className="glass-card p-4 border-yellow-500/20 flex items-center gap-3">
                    <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-sm text-yellow-400">{error}</span>
                </div>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="module-icon bg-green-500/10 border-green-500/20">
                            <Database size={18} className="text-green-400" />
                        </div>
                        <span className="status-badge bg-green-400/10 text-green-400 border border-green-400/20 text-[10px]">
                            Connected
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{metrics?.database.size || "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1">Database Size</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="module-icon bg-blue-500/10 border-blue-500/20">
                            <Wifi size={18} className="text-blue-400" />
                        </div>
                        <span className={`status-badge text-[10px] ${(metrics?.database.connections.total || 0) > 15
                                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                                : "bg-green-400/10 text-green-400 border border-green-400/20"
                            }`}>
                            {(metrics?.database.connections.total || 0) > 15 ? "High" : "Normal"}
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{metrics?.database.connections.total ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1">DB Connections</div>
                    <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="text-green-400">{metrics?.database.connections.active} active</span>
                        <span>{metrics?.database.connections.idle} idle</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="module-icon bg-purple-500/10 border-purple-500/20">
                            <MemoryStick size={18} className="text-purple-400" />
                        </div>
                        <span className={`status-badge text-[10px] ${(metrics?.system.memory.percent || 0) > 80
                                ? "bg-red-400/10 text-red-400 border border-red-400/20"
                                : "bg-green-400/10 text-green-400 border border-green-400/20"
                            }`}>
                            {metrics?.system.memory.percent ?? 0}% used
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metrics ? formatBytes(metrics.system.memory.used) : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Memory Used</div>
                    <div className="progress-bar mt-2">
                        <div className={`h-full rounded-full ${(metrics?.system.memory.percent || 0) > 80 ? 'bg-red-400' : 'bg-purple-400'}`}
                            style={{ width: `${metrics?.system.memory.percent || 0}%`, opacity: 0.7 }} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="module-icon bg-orange-500/10 border-orange-500/20">
                            <Cpu size={18} className="text-orange-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metrics ? (metrics.system.cpu.load_avg_1m * 10).toFixed(1) : "—"}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">CPU Load (1m avg)</div>
                    <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>{metrics?.system.cpu.count} cores</span>
                        <span>Uptime: {metrics ? formatUptime(metrics.system.uptime_seconds) : "—"}</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="chart-container">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-foreground">CPU & Memory Usage</h2>
                        <p className="text-xs text-muted-foreground">Last 20 readings</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}
                                tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="cpu" stroke="#f97316" strokeWidth={2} dot={false} name="CPU %" />
                            <Line type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} dot={false} name="Memory %" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-foreground">DB Connections</h2>
                        <p className="text-xs text-muted-foreground">Active connections over time</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="connGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="connections" stroke="#22c55e" strokeWidth={2}
                                fill="url(#connGrad)" dot={false} name="Connections" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Tables */}
            {metrics?.database.top_tables && metrics.database.top_tables.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Largest Tables</h2>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Schema</th>
                                    <th>Table Name</th>
                                    <th>Row Count</th>
                                    <th>Total Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.database.top_tables.map((table, idx) => (
                                    <tr key={idx}>
                                        <td><span className="text-xs text-muted-foreground font-mono">{table.schemaname}</span></td>
                                        <td><span className="text-sm font-medium font-mono">{table.tablename}</span></td>
                                        <td className="text-sm">{table.row_count?.toLocaleString() || 0}</td>
                                        <td className="text-sm text-muted-foreground">{table.size}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* System Info */}
            <div className="glass-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">System Information</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Platform", value: metrics?.system.platform || "—" },
                        { label: "Node.js", value: metrics?.system.node_version || "—" },
                        { label: "Total Memory", value: metrics ? formatBytes(metrics.system.memory.total) : "—" },
                        { label: "CPU Cores", value: metrics ? `${metrics.system.cpu.count} cores` : "—" },
                    ].map((info) => (
                        <div key={info.label} className="p-3 rounded-lg bg-muted/30">
                            <div className="text-xs text-muted-foreground mb-1">{info.label}</div>
                            <div className="text-sm font-medium font-mono text-foreground">{info.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
