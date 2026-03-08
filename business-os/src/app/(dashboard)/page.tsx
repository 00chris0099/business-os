"use client";

import { useEffect, useState } from "react";
import {
    Users, TrendingUp, DollarSign, Bot, Zap,
    Activity, ArrowUpRight, ArrowDownRight,
    ShoppingBag, Target, Clock, CheckCircle2,
    AlertCircle, RefreshCw
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { formatCurrency, formatNumber, getStatusColor } from "@/lib/utils";

const revenueData = [
    { month: "Jan", revenue: 42000, expenses: 28000 },
    { month: "Feb", revenue: 48000, expenses: 31000 },
    { month: "Mar", revenue: 41000, expenses: 27000 },
    { month: "Apr", revenue: 59000, expenses: 35000 },
    { month: "May", revenue: 64000, expenses: 38000 },
    { month: "Jun", revenue: 58000, expenses: 34000 },
    { month: "Jul", revenue: 72000, expenses: 41000 },
    { month: "Aug", revenue: 81000, expenses: 45000 },
    { month: "Sep", revenue: 76000, expenses: 43000 },
    { month: "Oct", revenue: 89000, expenses: 48000 },
    { month: "Nov", revenue: 95000, expenses: 52000 },
    { month: "Dec", revenue: 108000, expenses: 58000 },
];

const leadsData = [
    { name: "New", value: 35, color: "#a855f7" },
    { name: "Qualified", value: 28, color: "#6366f1" },
    { name: "Proposal", value: 18, color: "#3b82f6" },
    { name: "Converted", value: 19, color: "#22c55e" },
];

const agentActivityData = [
    { time: "00:00", tasks: 12, conversations: 24 },
    { time: "04:00", tasks: 8, conversations: 15 },
    { time: "08:00", tasks: 45, conversations: 88 },
    { time: "12:00", tasks: 72, conversations: 134 },
    { time: "16:00", tasks: 58, conversations: 102 },
    { time: "20:00", tasks: 31, conversations: 64 },
];

const automationData = [
    { day: "Mon", runs: 145, success: 138, failed: 7 },
    { day: "Tue", runs: 162, success: 158, failed: 4 },
    { day: "Wed", runs: 143, success: 135, failed: 8 },
    { day: "Thu", runs: 189, success: 182, failed: 7 },
    { day: "Fri", runs: 204, success: 198, failed: 6 },
    { day: "Sat", runs: 87, success: 84, failed: 3 },
    { day: "Sun", runs: 63, success: 61, failed: 2 },
];

const recentActivities = [
    { id: 1, type: "lead", message: "New lead from LinkedIn campaign", time: "2m ago", status: "new" },
    { id: 2, type: "order", message: "Order #ORD-2024-001 completed", time: "8m ago", status: "completed" },
    { id: 3, type: "agent", message: "AI Agent resolved 12 support tickets", time: "15m ago", status: "success" },
    { id: 4, type: "automation", message: "Invoice automation workflow triggered", time: "24m ago", status: "running" },
    { id: 5, type: "payment", message: "Payment received: $4,850.00", time: "31m ago", status: "success" },
    { id: 6, type: "alert", message: "Database connection pool at 78%", time: "45m ago", status: "pending" },
];

interface StatCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    iconBg: string;
    suffix?: string;
}

function StatCard({ title, value, change, icon, iconBg, suffix }: StatCardProps) {
    const isPositive = change >= 0;
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                    </div>
                </div>
                <div className={`module-icon ${iconBg}`}>
                    {icon}
                </div>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{Math.abs(change)}% vs last month</span>
            </div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-lg opacity-5 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top right, currentColor 0%, transparent 70%)` }} />
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0d0d1a] border border-border rounded-xl p-3 shadow-xl">
                <p className="text-xs text-muted-foreground mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground capitalize">{entry.name}:</span>
                        <span className="font-semibold text-foreground">
                            {typeof entry.value === 'number' && entry.name.includes('revenue')
                                ? formatCurrency(entry.value)
                                : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 shimmer rounded-lg" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-36 shimmer rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        Business Control Center
                        <span className="ml-2 status-badge bg-green-400/10 text-green-400 border border-green-400/20 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Live
                        </span>
                    </h1>
                    <p className="page-subtitle">
                        Real-time overview of all business operations — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button className="btn-secondary text-xs">
                    <RefreshCw size={13} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Clients"
                    value="2,847"
                    change={12.5}
                    icon={<Users size={18} className="text-indigo-400" />}
                    iconBg="bg-indigo-500/10 border-indigo-500/20"
                />
                <StatCard
                    title="New Leads"
                    value="384"
                    change={24.8}
                    icon={<Target size={18} className="text-purple-400" />}
                    iconBg="bg-purple-500/10 border-purple-500/20"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$108K"
                    change={18.2}
                    icon={<DollarSign size={18} className="text-green-400" />}
                    iconBg="bg-green-500/10 border-green-500/20"
                />
                <StatCard
                    title="Active Orders"
                    value="156"
                    change={-3.4}
                    icon={<ShoppingBag size={18} className="text-blue-400" />}
                    iconBg="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard
                    title="AI Agents"
                    value="12"
                    change={33.3}
                    icon={<Bot size={18} className="text-cyan-400" />}
                    iconBg="bg-cyan-500/10 border-cyan-500/20"
                />
                <StatCard
                    title="Workflow Runs"
                    value="1,043"
                    change={9.1}
                    icon={<Zap size={18} className="text-yellow-400" />}
                    iconBg="bg-yellow-500/10 border-yellow-500/20"
                />
                <StatCard
                    title="Open Opportunities"
                    value="89"
                    change={5.6}
                    icon={<TrendingUp size={18} className="text-orange-400" />}
                    iconBg="bg-orange-500/10 border-orange-500/20"
                />
                <StatCard
                    title="Avg Response Time"
                    value="1.4"
                    suffix="sec"
                    change={-22.0}
                    icon={<Activity size={18} className="text-pink-400" />}
                    iconBg="bg-pink-500/10 border-pink-500/20"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="chart-container lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Revenue vs Expenses</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">12-month financial overview</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-indigo-500" />Revenue
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-500/60" />Expenses
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                                tickFormatter={(v) => `$${v / 1000}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                                fill="url(#revenueGrad)" dot={false} />
                            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2}
                                fill="url(#expensesGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Leads Funnel */}
                <div className="chart-container">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Lead Funnel</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Current distribution</p>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={leadsData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                paddingAngle={4} dataKey="value">
                                {leadsData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} opacity={0.9} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {leadsData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-muted-foreground">{item.name}</span>
                                <span className="text-xs font-semibold text-foreground ml-auto">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* AI Agent Activity */}
                <div className="chart-container">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">AI Agent Activity</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">24h tasks & conversations</p>
                        </div>
                        <span className="status-badge bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-[10px]">
                            <Bot size={10} /> Active
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={agentActivityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="tasks" stroke="#06b6d4" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="conversations" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Automation Performance */}
                <div className="chart-container">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Automation Performance</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">7-day workflow runs</p>
                        </div>
                        <span className="status-badge bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px]">
                            <Zap size={10} /> 993 Success
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={automationData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="success" fill="#22c55e" opacity={0.8} radius={[3, 3, 0, 0]} />
                            <Bar dataKey="failed" fill="#f43f5e" opacity={0.7} radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Activity */}
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="section-header">
                        <h2 className="section-title text-base">Recent Activity</h2>
                        <button className="text-xs text-primary hover:text-primary/80 transition-colors">View All</button>
                    </div>
                    <div className="space-y-1">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.status === 'success' || activity.status === 'completed' ? 'bg-green-400' :
                                        activity.status === 'new' ? 'bg-purple-400' :
                                            activity.status === 'running' ? 'bg-blue-400 animate-pulse' :
                                                'bg-yellow-400'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">{activity.message}</p>
                                </div>
                                <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                                    <Clock size={11} />
                                    {activity.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="glass-card p-6">
                    <div className="section-header">
                        <h2 className="section-title text-base">System Health</h2>
                        <span className="status-badge bg-green-400/10 text-green-400 border border-green-400/20 text-[10px]">
                            Healthy
                        </span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Database", value: 42, color: "bg-green-400", status: "Healthy" },
                            { label: "API Response", value: 28, color: "bg-blue-400", status: "Fast (124ms)" },
                            { label: "Memory", value: 64, color: "bg-yellow-400", status: "7.2GB / 16GB" },
                            { label: "CPU", value: 31, color: "bg-indigo-400", status: "31% Load" },
                            { label: "Storage", value: 58, color: "bg-purple-400", status: "284GB Used" },
                        ].map((metric) => (
                            <div key={metric.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-foreground">{metric.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{metric.status}</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`h-full rounded-full ${metric.color}`}
                                        style={{ width: `${metric.value}%`, opacity: 0.7 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
