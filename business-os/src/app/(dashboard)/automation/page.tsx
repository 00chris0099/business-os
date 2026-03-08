"use client";

import { useState, useEffect } from "react";
import {
    Zap, Plus, Play, Pause, Settings, MoreHorizontal,
    CheckCircle2, XCircle, Clock, RefreshCw, X, ExternalLink,
    Activity, AlertTriangle, List, Loader2
} from "lucide-react";
import { formatDateTime, getStatusColor } from "@/lib/utils";

interface Workflow {
    id: string;
    name: string;
    description: string;
    trigger_type: string;
    is_active: boolean;
    total_runs: number;
    success_count: number;
    error_count: number;
    last_run_at: string;
    n8n_workflow_id: string;
    tags: string[];
    created_at: string;
}

const mockWorkflows: Workflow[] = [
    {
        id: "1", name: "New Lead Nurture Sequence", description: "Automatically sends follow-up emails to new leads",
        trigger_type: "webhook", is_active: true, total_runs: 1284, success_count: 1270, error_count: 14,
        last_run_at: new Date().toISOString(), n8n_workflow_id: "wf_001", tags: ["crm", "email"],
        created_at: new Date().toISOString()
    },
    {
        id: "2", name: "Invoice Auto-Generation", description: "Creates invoices from completed orders automatically",
        trigger_type: "schedule", is_active: true, total_runs: 847, success_count: 844, error_count: 3,
        last_run_at: new Date(Date.now() - 3600000).toISOString(), n8n_workflow_id: "wf_002", tags: ["erp", "finance"],
        created_at: new Date().toISOString()
    },
    {
        id: "3", name: "Support Ticket Classifier", description: "AI-powered support ticket routing and classification",
        trigger_type: "webhook", is_active: true, total_runs: 3847, success_count: 3800, error_count: 47,
        last_run_at: new Date(Date.now() - 600000).toISOString(), n8n_workflow_id: "wf_003", tags: ["ai", "support"],
        created_at: new Date().toISOString()
    },
    {
        id: "4", name: "Daily Analytics Report", description: "Generates and sends daily business reports to managers",
        trigger_type: "schedule", is_active: false, total_runs: 284, success_count: 280, error_count: 4,
        last_run_at: new Date(Date.now() - 86400000).toISOString(), n8n_workflow_id: "wf_004", tags: ["analytics"],
        created_at: new Date().toISOString()
    },
];

const recentRuns = [
    { id: "1", workflow: "New Lead Nurture Sequence", status: "success", duration: "2.4s", triggered: "2m ago" },
    { id: "2", workflow: "Support Ticket Classifier", status: "success", duration: "0.8s", triggered: "5m ago" },
    { id: "3", workflow: "Invoice Auto-Generation", status: "error", duration: "12s", triggered: "2h ago" },
    { id: "4", workflow: "New Lead Nurture Sequence", status: "success", duration: "1.9s", triggered: "3h ago" },
    { id: "5", workflow: "Daily Analytics Report", status: "success", duration: "45s", triggered: "1d ago" },
];

export default function AutomationPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [triggeringId, setTriggeringId] = useState<string | null>(null);
    const [newWorkflow, setNewWorkflow] = useState({ name: "", description: "", n8n_workflow_id: "", trigger_type: "webhook" });

    const handleTrigger = async (workflowId: string) => {
        setTriggeringId(workflowId);
        try {
            const res = await fetch(`/api/automation/workflows/${workflowId}/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trigger_data: { source: "dashboard", timestamp: new Date().toISOString() } }),
            });
            if (res.ok) {
                setWorkflows(wfs => wfs.map(wf =>
                    wf.id === workflowId
                        ? { ...wf, total_runs: wf.total_runs + 1, last_run_at: new Date().toISOString() }
                        : wf
                ));
            }
        } catch { } finally {
            setTimeout(() => setTriggeringId(null), 1500);
        }
    };

    const handleAddWorkflow = async () => {
        try {
            const res = await fetch("/api/automation/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newWorkflow),
            });
            if (res.ok) {
                const data = await res.json();
                setWorkflows([data.data, ...workflows]);
                setShowAddModal(false);
                setNewWorkflow({ name: "", description: "", n8n_workflow_id: "", trigger_type: "webhook" });
            }
        } catch { }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-yellow-500/10 border-yellow-500/20">
                            <Zap size={18} className="text-yellow-400" />
                        </span>
                        Automation
                    </h1>
                    <p className="page-subtitle mt-1">Orchestrate workflows via n8n integration</p>
                </div>
                <div className="flex items-center gap-3">
                    {process.env.N8N_BASE_URL && (
                        <a href={process.env.N8N_BASE_URL} target="_blank" rel="noopener noreferrer"
                            className="btn-secondary text-xs">
                            <ExternalLink size={13} /> Open n8n
                        </a>
                    )}
                    <button onClick={() => setShowAddModal(true)} className="btn-primary">
                        <Plus size={16} /> Add Workflow
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Total Workflows", value: workflows.length.toString(), color: "text-yellow-400" },
                    { label: "Active", value: workflows.filter(w => w.is_active).length.toString(), color: "text-green-400" },
                    { label: "Runs Today", value: "204", color: "text-blue-400" },
                    { label: "Success Rate", value: "96.8%", color: "text-emerald-400" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-4">
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Workflows */}
                <div className="space-y-3 lg:col-span-2">
                    <h2 className="text-sm font-semibold text-foreground">Workflows</h2>
                    {workflows.map((wf) => {
                        const successRate = wf.total_runs > 0
                            ? Math.round((wf.success_count / wf.total_runs) * 100)
                            : 0;
                        const isTriggering = triggeringId === wf.id;

                        return (
                            <div key={wf.id} className="glass-card p-5 hover:border-primary/20 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${wf.is_active ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-gray-500/10 border border-gray-500/20"
                                            }`}>
                                            <Zap size={18} className={wf.is_active ? "text-yellow-400" : "text-gray-500"} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm text-foreground">{wf.name}</h3>
                                                <span className={`status-badge ${wf.is_active ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-gray-400/10 text-gray-400'} text-[10px]`}>
                                                    {wf.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{wf.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleTrigger(wf.id)}
                                            disabled={!wf.is_active || isTriggering}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${wf.is_active
                                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"
                                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                                }`}
                                        >
                                            {isTriggering ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                            {isTriggering ? "Running..." : "Trigger"}
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                            <Settings size={14} />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Activity size={11} />
                                        <span>{wf.total_runs.toLocaleString()} runs</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-green-400">
                                        <CheckCircle2 size={11} />
                                        <span>{wf.success_count.toLocaleString()} success</span>
                                    </div>
                                    {wf.error_count > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                                            <XCircle size={11} />
                                            <span>{wf.error_count} errors</span>
                                        </div>
                                    )}
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {successRate}% success rate
                                        </span>
                                        <div className="w-16 progress-bar">
                                            <div className={`h-full rounded-full ${successRate > 95 ? 'bg-green-400' : successRate > 80 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                style={{ width: `${successRate}%`, opacity: 0.8 }} />
                                        </div>
                                    </div>
                                </div>

                                {wf.tags.length > 0 && (
                                    <div className="flex gap-1.5 mt-3">
                                        {wf.tags.map((tag) => (
                                            <span key={tag} className="chip text-[10px] px-2 py-0.5">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Recent Runs */}
                <div>
                    <h2 className="text-sm font-semibold text-foreground mb-3">Recent Runs</h2>
                    <div className="glass-card divide-y divide-border">
                        {recentRuns.map((run) => (
                            <div key={run.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-start gap-2 mb-1.5">
                                    {run.status === "success" ? (
                                        <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    ) : run.status === "error" ? (
                                        <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <Loader2 size={14} className="text-blue-400 mt-0.5 flex-shrink-0 animate-spin" />
                                    )}
                                    <p className="text-xs text-foreground leading-relaxed">{run.workflow}</p>
                                </div>
                                <div className="flex items-center justify-between ml-4">
                                    <span className={`text-[10px] font-medium ${run.status === "success" ? "text-green-400" : "text-red-400"
                                        }`}>
                                        {run.status}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground font-mono">{run.duration}</span>
                                        <span className="text-[10px] text-muted-foreground">{run.triggered}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Workflow Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="glass-card w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Add Workflow</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Workflow Name *</label>
                                <input className="input-field" placeholder="e.g. Lead Follow-up Sequence"
                                    value={newWorkflow.name} onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Description</label>
                                <input className="input-field" placeholder="What does this workflow do?"
                                    value={newWorkflow.description} onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">n8n Workflow ID</label>
                                <input className="input-field font-mono" placeholder="e.g. wf_abc123"
                                    value={newWorkflow.n8n_workflow_id} onChange={(e) => setNewWorkflow({ ...newWorkflow, n8n_workflow_id: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Trigger Type</label>
                                <select className="input-field" value={newWorkflow.trigger_type}
                                    onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger_type: e.target.value })}>
                                    <option value="webhook">Webhook</option>
                                    <option value="schedule">Schedule</option>
                                    <option value="manual">Manual</option>
                                    <option value="event">Event</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleAddWorkflow} className="btn-primary" disabled={!newWorkflow.name}>
                                <Plus size={15} /> Add Workflow
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
