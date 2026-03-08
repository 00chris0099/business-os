"use client";

import { Building2, Plus, Globe, Users, Package, Shield } from "lucide-react";

const companies = [
    { id: "1", name: "My Business", slug: "my-business", industry: "Technology", plan: "enterprise", users: 48, clients: 2847, status: "active" },
    { id: "2", name: "Subsidiary Corp", slug: "subsidiary-corp", industry: "Finance", plan: "professional", users: 12, clients: 384, status: "active" },
];

export default function CompaniesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-teal-500/10 border-teal-500/20">
                            <Building2 size={18} className="text-teal-400" />
                        </span>
                        Companies
                    </h1>
                    <p className="page-subtitle mt-1">Multi-company management and configuration</p>
                </div>
                <button className="btn-primary">
                    <Plus size={16} /> Add Company
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {companies.map((company) => (
                    <div key={company.id} className="glass-card p-6 hover:border-primary/20 transition-all cursor-pointer">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                <Building2 size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-foreground">{company.name}</h3>
                                    <span className="status-badge bg-green-400/10 text-green-400 border border-green-400/20 text-[10px]">
                                        {company.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{company.industry}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Globe size={11} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{company.slug}.businessos.com</span>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${company.plan === "enterprise"
                                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                {company.plan}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
                                    <Users size={14} />
                                    <span className="text-lg font-bold">{company.users}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Users</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
                                    <Package size={14} />
                                    <span className="text-lg font-bold">{company.clients.toLocaleString()}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Clients</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-green-400 mb-1">
                                    <Shield size={14} />
                                    <span className="text-lg font-bold">RBAC</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Security</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
