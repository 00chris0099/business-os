"use client";

import { Shield, Plus, MoreHorizontal, Search, Trash, Edit, Mail, Lock } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const ROLES = [
    { name: "super_admin", display: "Super Admin", color: "text-red-400 bg-red-400/10 border-red-400/20", description: "Full system access" },
    { name: "admin", display: "Admin", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", description: "Company administration" },
    { name: "manager", display: "Manager", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", description: "Team management" },
    { name: "agent", display: "Agent", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", description: "Operational access" },
    { name: "viewer", display: "Viewer", color: "text-gray-400 bg-gray-400/10 border-gray-400/20", description: "Read-only access" },
];

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("agent");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                setError("Failed to load users");
            }
        } catch (error) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // Only display super_admin option client side if primary_admin (or test API will block it)
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, role }),
            });

            if (res.ok) {
                setIsCreateOpen(false);
                setEmail(""); setPassword(""); setName(""); setRole("agent");
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create user");
            }
        } catch {
            setError("Unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string, is_primary_admin: boolean) => {
        if (is_primary_admin) {
            alert("The primary super administrator cannot be deleted.");
            return;
        }

        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete user");
            }
        } catch {
            alert("Failed to delete user");
        }
    };

    // Derived permissions
    const canCreateUsers = session?.user?.role === "super_admin" || session?.user?.role === "admin";
    const canCreateSuperAdmin = session?.user?.is_primary_admin;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-red-500/10 border-red-500/20">
                            <Shield size={18} className="text-red-400" />
                        </span>
                        User Management
                    </h1>
                    <p className="page-subtitle mt-1">Manage users, roles, and permissions with RBAC.</p>
                </div>
                {canCreateUsers && (
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
                        <Plus size={16} /> Add User
                    </button>
                )}
            </div>

            {isCreateOpen && (
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">Create New User</h2>
                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                    <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                            <input required value={name} onChange={e => setName(e.target.value)} type="text" className="input-field w-full" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-field w-full" placeholder="john@business.com" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                            <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="input-field w-full" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="input-field w-full">
                                {canCreateSuperAdmin && <option value="super_admin">Super Admin</option>}
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="agent">Agent</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-ghost text-sm">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm flex items-center gap-2">{isSubmitting ? "Creating..." : "Create User"}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="glass-card">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Search users by name or email..." className="input-field pl-9 w-64 text-sm" />
                    </div>
                    <span className="text-xs text-muted-foreground">{users.length} users</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access Level</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</td></tr>
                            ) : users.map((user) => {
                                const roleInfo = ROLES.find(r => r.name === user.role);
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar w-8 h-8 text-xs">{getInitials(user.name)}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                                        {user.name}
                                                        {user.is_primary_admin && <span title="Primary Administrator"><Lock size={12} className="text-indigo-400" /></span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-sm text-muted-foreground flex items-center gap-2"><Mail size={12} /> {user.email}</td>
                                        <td>
                                            {roleInfo && (
                                                <span className={`status-badge ${roleInfo.color} border text-[10px]`}>{roleInfo.display}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="status-badge text-[10px] bg-green-400/10 text-green-400 border border-green-400/20">Active</span>
                                        </td>
                                        <td className="text-xs text-muted-foreground">{roleInfo?.description}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button className="p-1.5 rounded hover:bg-white/5 text-muted-foreground" title="Edit Role">
                                                    <Edit size={14} />
                                                </button>
                                                {!user.is_primary_admin && canCreateUsers && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.is_primary_admin)}
                                                        className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors" title="Delete User">
                                                        <Trash size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
