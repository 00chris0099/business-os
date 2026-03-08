"use client";

import { Settings, Database, Key, Bell, Palette, Shield, Globe, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [dbUrl, setDbUrl] = useState("postgres://crm_user:••••••••@postgress_postgres-crm:5432/crm_db");
    const [n8nUrl, setN8nUrl] = useState("");
    const [openaiKey, setOpenaiKey] = useState("");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title flex items-center gap-2">
                    <span className="module-icon bg-gray-500/10 border-gray-500/20">
                        <Settings size={18} className="text-gray-400" />
                    </span>
                    Settings
                </h1>
                <p className="page-subtitle mt-1">Configure your Business OS platform</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar nav */}
                <div className="glass-card p-3 h-fit">
                    {[
                        { icon: Database, label: "Database", active: true },
                        { icon: Key, label: "API Keys" },
                        { icon: Globe, label: "Integrations" },
                        { icon: Bell, label: "Notifications" },
                        { icon: Palette, label: "Appearance" },
                        { icon: Shield, label: "Security" },
                    ].map(({ icon: Icon, label, active }) => (
                        <button key={label} className={`sidebar-nav-item w-full ${active ? "active" : ""}`}>
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Main content */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-card p-6">
                        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Database size={16} className="text-orange-400" /> Database Configuration
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Database URL</label>
                                <input
                                    type="password"
                                    className="input-field font-mono text-xs"
                                    value={dbUrl}
                                    onChange={(e) => setDbUrl(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">PostgreSQL connection string from DATABASE_URL env variable</p>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-400/5 border border-green-400/20">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs text-green-400 font-medium">Database connected successfully</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Key size={16} className="text-purple-400" /> API Keys
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">OpenAI API Key</label>
                                <input
                                    type="password"
                                    className="input-field font-mono text-xs"
                                    placeholder="sk-..."
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">n8n Base URL</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="http://your-n8n-instance:5678"
                                    value={n8nUrl}
                                    onChange={(e) => setN8nUrl(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary text-sm">
                                <Save size={14} /> Save API Keys
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Database size={16} className="text-orange-400" /> Schema Initialization
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Initialize the database schema for all modules. This will create all required tables if they don&apos;t exist.
                        </p>
                        <button className="btn-secondary text-sm">
                            <Database size={14} /> Run Schema Migration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
