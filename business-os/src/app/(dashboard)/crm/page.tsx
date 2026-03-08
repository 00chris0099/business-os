"use client";

import { useState, useEffect } from "react";
import {
    Users, Search, Plus, Filter,
    MoreHorizontal, Mail, Phone, Globe,
    Tags, ChevronLeft, ChevronRight, X, Edit2
} from "lucide-react";
import { formatDate, getStatusColor, getInitials } from "@/lib/utils";

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    industry: string;
    website: string;
    status: string;
    tags: string[];
    created_at: string;
    assigned_to_name?: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const statusOptions = ["all", "active", "inactive", "prospect"];

export default function CRMPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("clients");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", city: "", country: "", industry: "", status: "active" });

    const fetchClients = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(statusFilter !== "all" && { status: statusFilter }),
            });
            const res = await fetch(`/api/crm/clients?${params}`);
            const data = await res.json();
            setClients(data.data || []);
            setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
        } catch (err) {
            console.error("Error fetching clients:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchClients(1), 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const handleAddClient = async () => {
        try {
            const res = await fetch("/api/crm/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClient),
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewClient({ name: "", email: "", phone: "", city: "", country: "", industry: "", status: "active" });
                fetchClients(1);
            }
        } catch (err) {
            console.error("Error creating client:", err);
        }
    };

    const tabs = [
        { id: "clients", label: "Clients", count: pagination.total },
        { id: "leads", label: "Leads", count: 384 },
        { id: "pipeline", label: "Pipeline", count: 89 },
        { id: "activities", label: "Activities", count: 247 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon">
                            <Users size={18} className="text-indigo-400" />
                        </span>
                        CRM
                    </h1>
                    <p className="page-subtitle mt-1">Manage clients, leads, and sales pipeline</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                >
                    <Plus size={16} />
                    Add Client
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Total Clients", value: "2,847", color: "text-indigo-400" },
                    { label: "Active", value: "2,394", color: "text-green-400" },
                    { label: "New (30d)", value: "143", color: "text-purple-400" },
                    { label: "At Risk", value: "58", color: "text-red-400" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-4">
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                                ? "bg-background text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 text-xs ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table Card */}
            <div className="glass-card">
                {/* Filters */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-9 w-64 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {statusOptions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${statusFilter === s
                                            ? "bg-primary/15 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{pagination.total} total</span>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-8 space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-14 shimmer rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Industry</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th>Assigned</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No clients found. Add your first client!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr key={client.id} className="cursor-pointer">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                                                        {getInitials(client.name || "?")}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-foreground">{client.name}</div>
                                                        {client.website && (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <Globe size={10} />
                                                                {client.website}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="space-y-0.5">
                                                    {client.email && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail size={11} /> {client.email}
                                                        </div>
                                                    )}
                                                    {client.phone && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone size={11} /> {client.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-sm text-muted-foreground">
                                                {[client.city, client.country].filter(Boolean).join(", ") || "—"}
                                            </td>
                                            <td className="text-sm text-muted-foreground">{client.industry || "—"}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(client.status)}`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="text-xs text-muted-foreground">
                                                {formatDate(client.created_at)}
                                            </td>
                                            <td className="text-xs text-muted-foreground">
                                                {client.assigned_to_name || "—"}
                                            </td>
                                            <td>
                                                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                    <MoreHorizontal size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchClients(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <button
                                onClick={() => fetchClients(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="glass-card w-full max-w-lg p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Add New Client</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Company Name *</label>
                                <input
                                    className="input-field"
                                    placeholder="Acme Corp"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="contact@company.com"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Phone</label>
                                <input
                                    className="input-field"
                                    placeholder="+1 (555) 000-0000"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">City</label>
                                <input
                                    className="input-field"
                                    placeholder="New York"
                                    value={newClient.city}
                                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Country</label>
                                <input
                                    className="input-field"
                                    placeholder="United States"
                                    value={newClient.country}
                                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Industry</label>
                                <input
                                    className="input-field"
                                    placeholder="Technology"
                                    value={newClient.industry}
                                    onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Status</label>
                                <select
                                    className="input-field"
                                    value={newClient.status}
                                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="prospect">Prospect</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleAddClient} className="btn-primary" disabled={!newClient.name}>
                                <Plus size={15} /> Add Client
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
