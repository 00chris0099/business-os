"use client";

import {
    BarChart3, TrendingUp, TrendingDown, Users, DollarSign,
    Zap, Bot, Target, Activity, RefreshCw
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const customerGrowthData = [
    { month: "Jan", new: 145, churned: 12, net: 133 },
    { month: "Feb", new: 162, churned: 8, net: 154 },
    { month: "Mar", new: 178, churned: 15, net: 163 },
    { month: "Apr", new: 195, churned: 11, net: 184 },
    { month: "May", new: 220, churned: 9, net: 211 },
    { month: "Jun", new: 243, churned: 14, net: 229 },
    { month: "Jul", new: 267, churned: 10, net: 257 },
    { month: "Aug", new: 298, churned: 13, net: 285 },
    { month: "Sep", new: 312, churned: 11, net: 301 },
    { month: "Oct", new: 334, churned: 16, net: 318 },
    { month: "Nov", new: 358, churned: 12, net: 346 },
    { month: "Dec", new: 384, churned: 9, net: 375 },
];

const revenueByChannel = [
    { name: "Direct Sales", value: 42, color: "#6366f1" },
    { name: "Online Store", value: 28, color: "#8b5cf6" },
    { name: "Partners", value: 18, color: "#a855f7" },
    { name: "Referrals", value: 12, color: "#22c55e" },
];

const conversionData = [
    { stage: "Visitors", count: 10000 },
    { stage: "Leads", count: 2400 },
    { stage: "Qualified", count: 980 },
    { stage: "Proposal", count: 420 },
    { stage: "Won", count: 156 },
];

const aiUsageData = [
    { subject: "Lead Qualify", A: 120, full: 150 },
    { subject: "Support", A: 98, full: 150 },
    { subject: "Analytics", A: 86, full: 150 },
    { subject: "Email Draft", A: 99, full: 150 },
    { subject: "Data Entry", A: 85, full: 150 },
    { subject: "Reporting", A: 65, full: 150 },
];

const automationROI = [
    { month: "Jan", saved: 12000, cost: 800 },
    { month: "Feb", saved: 15000, cost: 800 },
    { month: "Mar", saved: 14000, cost: 950 },
    { month: "Apr", saved: 18000, cost: 950 },
    { month: "May", saved: 21000, cost: 1100 },
    { month: "Jun", saved: 24000, cost: 1100 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-violet-500/10 border-violet-500/20">
                            <BarChart3 size={18} className="text-violet-400" />
                        </span>
                        Analytics
                    </h1>
                    <p className="page-subtitle mt-1">Business intelligence, performance metrics, and AI insights</p>
                </div>
                <div className="flex gap-2">
                    {["7d", "30d", "90d", "1y"].map((period) => (
                        <button key={period} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${period === "1y"
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}>
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", value: "$1.24M", change: "+18.2%", positive: true, icon: DollarSign, color: "text-green-400" },
                    { label: "Total Customers", value: "2,847", change: "+23.4%", positive: true, icon: Users, color: "text-indigo-400" },
                    { label: "Conversion Rate", value: "23.8%", change: "+2.1%", positive: true, icon: Target, color: "text-purple-400" },
                    { label: "Churn Rate", value: "2.4%", change: "-0.8%", positive: true, icon: Activity, color: "text-orange-400" },
                ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="stat-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="module-icon bg-white/5">
                                    <Icon size={18} className={kpi.color} />
                                </div>
                                <span className={`text-xs font-medium ${kpi.positive ? "text-green-400" : "text-red-400"}`}>
                                    {kpi.positive ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
                                    {kpi.change}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Customer Growth + Revenue by Channel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="chart-container lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Customer Growth</h2>
                            <p className="text-xs text-muted-foreground">New vs churned customers per month</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" />New</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Churned</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Net</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={customerGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="new" fill="#6366f1" opacity={0.9} radius={[3, 3, 0, 0]} />
                            <Bar dataKey="churned" fill="#f43f5e" opacity={0.7} radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Revenue by Channel</h2>
                        <p className="text-xs text-muted-foreground">Annual distribution</p>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={revenueByChannel} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                                paddingAngle={4} dataKey="value">
                                {revenueByChannel.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => [`${v}%`, ""]} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                        {revenueByChannel.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conversion Funnel + AI Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="chart-container">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Sales Conversion Funnel</h2>
                        <p className="text-xs text-muted-foreground">Visitor-to-customer pipeline</p>
                    </div>
                    <div className="space-y-3">
                        {conversionData.map((stage, idx) => {
                            const pct = Math.round((stage.count / conversionData[0].count) * 100);
                            const colors = ["bg-indigo-500", "bg-purple-500", "bg-violet-500", "bg-fuchsia-500", "bg-pink-500"];
                            return (
                                <div key={stage.stage}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-foreground">{stage.stage}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">{stage.count.toLocaleString()}</span>
                                            <span className="text-xs font-semibold text-foreground w-8 text-right">{pct}%</span>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className={`h-full rounded-full ${colors[idx]}`}
                                            style={{ width: `${pct}%`, opacity: 0.8 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="chart-container">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">AI Usage by Task Type</h2>
                        <p className="text-xs text-muted-foreground">Task distribution across AI agents</p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={aiUsageData}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                            <PolarRadiusAxis tick={{ fill: '#666', fontSize: 9 }} axisLine={false} />
                            <Radar name="AI Usage" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Automation ROI */}
            <div className="chart-container">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Automation ROI</h2>
                        <p className="text-xs text-muted-foreground">Time & cost savings vs automation cost</p>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Total saved:</span>
                        <span className="text-sm font-bold text-green-400">{formatCurrency(104000)}</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={automationROI}>
                        <defs>
                            <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => `$${v / 1000}K`} />
                        <Tooltip formatter={(v) => [formatCurrency(Number(v)), ""]} />
                        <Area type="monotone" dataKey="saved" stroke="#22c55e" strokeWidth={2}
                            fill="url(#savedGrad)" dot={false} name="Time Saved" />
                        <Line type="monotone" dataKey="cost" stroke="#f43f5e" strokeWidth={2} dot={false} name="Cost" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
