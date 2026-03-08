"use client";

import { useState, useEffect } from "react";
import {
    Bot, Plus, Play, Pause, Settings, MessageSquare,
    Activity, Brain, Cpu, Zap, X, ChevronRight,
    MoreHorizontal, Clock, CheckCircle2
} from "lucide-react";
import { formatDateTime, getStatusColor } from "@/lib/utils";

interface Agent {
    id: string;
    name: string;
    description: string;
    type: string;
    model: string;
    is_active: boolean;
    total_conversations: number;
    total_tokens_used: number;
    created_at: string;
    capabilities: string[];
}

const mockAgents: Agent[] = [
    {
        id: "1", name: "Sales Assistant", description: "Handles lead qualification and sales inquiries",
        type: "assistant", model: "gpt-4o", is_active: true, total_conversations: 1284,
        total_tokens_used: 2840000, created_at: new Date().toISOString(),
        capabilities: ["lead_qualification", "email_drafting", "crm_update"]
    },
    {
        id: "2", name: "Support Bot", description: "Resolves customer support tickets automatically",
        type: "support", model: "gpt-4o-mini", is_active: true, total_conversations: 3847,
        total_tokens_used: 5200000, created_at: new Date().toISOString(),
        capabilities: ["ticket_resolution", "knowledge_base", "escalation"]
    },
    {
        id: "3", name: "Data Analyst", description: "Analyzes business data and generates insights",
        type: "analyst", model: "gpt-4o", is_active: false, total_conversations: 284,
        total_tokens_used: 1200000, created_at: new Date().toISOString(),
        capabilities: ["data_analysis", "report_generation", "chart_creation"]
    },
];

const recentTasks = [
    { id: "1", agent: "Sales Assistant", task: "Qualify 24 new leads from LinkedIn", status: "completed", duration: "4m 32s", time: "5m ago" },
    { id: "2", agent: "Support Bot", task: "Resolve ticket #2847 - Password reset", status: "completed", duration: "1m 12s", time: "8m ago" },
    { id: "3", agent: "Sales Assistant", task: "Draft proposal for Acme Corp", status: "running", duration: "2m 18s", time: "12m ago" },
    { id: "4", agent: "Data Analyst", task: "Generate Q4 revenue report", status: "pending", duration: "—", time: "20m ago" },
    { id: "5", agent: "Support Bot", task: "Analyzed 156 chat conversations", status: "completed", duration: "8m 43s", time: "34m ago" },
];

export default function AIAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>(mockAgents);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [newAgent, setNewAgent] = useState({
        name: "", description: "", type: "assistant", model: "gpt-4o",
        system_prompt: "", temperature: "0.7", max_tokens: "2000"
    });

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch("/api/ai/agents");
                const data = await res.json();
                if (data.data && data.data.length > 0) {
                    setAgents(data.data);
                }
            } catch { }
        };
        fetchAgents();
    }, []);

    const handleAddAgent = async () => {
        try {
            const res = await fetch("/api/ai/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newAgent,
                    temperature: parseFloat(newAgent.temperature),
                    max_tokens: parseInt(newAgent.max_tokens),
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setAgents([data.data, ...agents]);
                setShowAddModal(false);
            }
        } catch { }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-cyan-500/10 border-cyan-500/20">
                            <Bot size={18} className="text-cyan-400" />
                        </span>
                        AI Agents
                    </h1>
                    <p className="page-subtitle mt-1">Manage and monitor your AI workforce</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <Plus size={16} /> New Agent
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Total Agents", value: agents.length.toString(), icon: Bot, color: "text-cyan-400" },
                    { label: "Active", value: agents.filter(a => a.is_active).length.toString(), icon: Activity, color: "text-green-400" },
                    { label: "Tasks Today", value: "284", icon: Zap, color: "text-yellow-400" },
                    { label: "Total Conversations", value: "5.4K", icon: MessageSquare, color: "text-purple-400" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Icon size={18} className={stat.color} />
                            </div>
                            <div>
                                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Agents Grid + Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Agents List */}
                <div className="space-y-3 lg:col-span-2">
                    <h2 className="text-sm font-semibold text-foreground">Deployed Agents</h2>
                    {agents.map((agent) => (
                        <div
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={`glass-card p-5 cursor-pointer transition-all duration-200 hover:border-primary/30 ${selectedAgent?.id === agent.id ? "border-primary/40 bg-primary/5" : ""
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${agent.is_active
                                            ? "bg-cyan-500/15 border border-cyan-500/20"
                                            : "bg-gray-500/10 border border-gray-500/20"
                                        }`}>
                                        <Brain size={22} className={agent.is_active ? "text-cyan-400" : "text-gray-500"} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{agent.name}</h3>
                                            <span className={`status-badge ${agent.is_active ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-gray-400/10 text-gray-400 border-gray-400/20'}`}>
                                                {agent.is_active ? "Active" : "Paused"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Cpu size={11} />
                                                <span className="font-mono">{agent.model}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MessageSquare size={11} />
                                                <span>{agent.total_conversations.toLocaleString()} conversations</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Zap size={11} />
                                                <span>{(agent.total_tokens_used / 1000000).toFixed(1)}M tokens</span>
                                            </div>
                                        </div>
                                        {agent.capabilities && agent.capabilities.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {agent.capabilities.map((cap) => (
                                                    <span key={cap} className="chip text-[10px] px-2 py-0.5">
                                                        {cap.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button className={`p-2 rounded-lg transition-colors ${agent.is_active ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-400' : 'hover:bg-green-500/10 text-muted-foreground hover:text-green-400'}`}>
                                        {agent.is_active ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                        <Settings size={16} />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Tasks */}
                <div>
                    <h2 className="text-sm font-semibold text-foreground mb-3">Recent Tasks</h2>
                    <div className="glass-card divide-y divide-border">
                        {recentTasks.map((task) => (
                            <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-start gap-2 mb-2">
                                    {task.status === "completed" ? (
                                        <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    ) : task.status === "running" ? (
                                        <Activity size={14} className="text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
                                    ) : (
                                        <Clock size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    <p className="text-xs text-foreground leading-relaxed">{task.task}</p>
                                </div>
                                <div className="flex items-center justify-between ml-4">
                                    <span className="text-[10px] text-muted-foreground">{task.agent}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground font-mono">{task.duration}</span>
                                        <span className="text-[10px] text-muted-foreground">{task.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Agent Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="glass-card w-full max-w-xl p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Create New AI Agent</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Agent Name *</label>
                                    <input className="input-field" placeholder="e.g. Sales Assistant" value={newAgent.name}
                                        onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Type</label>
                                    <select className="input-field" value={newAgent.type}
                                        onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}>
                                        <option value="assistant">Assistant</option>
                                        <option value="support">Support</option>
                                        <option value="analyst">Analyst</option>
                                        <option value="automation">Automation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">AI Model</label>
                                    <select className="input-field" value={newAgent.model}
                                        onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}>
                                        <option value="gpt-4o">GPT-4o</option>
                                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Description</label>
                                    <input className="input-field" placeholder="Describe what this agent does"
                                        value={newAgent.description}
                                        onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">System Prompt</label>
                                    <textarea className="input-field min-h-[100px] resize-none"
                                        placeholder="You are a helpful AI assistant that..."
                                        value={newAgent.system_prompt}
                                        onChange={(e) => setNewAgent({ ...newAgent, system_prompt: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Temperature ({newAgent.temperature})</label>
                                    <input type="range" min="0" max="1" step="0.1" className="w-full accent-primary"
                                        value={newAgent.temperature}
                                        onChange={(e) => setNewAgent({ ...newAgent, temperature: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Max Tokens</label>
                                    <input className="input-field" type="number" placeholder="2000"
                                        value={newAgent.max_tokens}
                                        onChange={(e) => setNewAgent({ ...newAgent, max_tokens: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleAddAgent} className="btn-primary" disabled={!newAgent.name}>
                                <Bot size={15} /> Create Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
