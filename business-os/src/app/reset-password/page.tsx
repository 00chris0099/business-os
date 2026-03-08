"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMsg("");

        if (!token) {
            setError("Invalid or missing reset token.");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            if (res.ok) {
                setSuccessMsg("Password successfully reset. You can now log in.");
                setTimeout(() => router.push("/login"), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to reset password");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 glass-card animate-fade-in-up relative z-10 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
                        <Bot size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Set New Password
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">Choose a secure password</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-red-400">{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-400">{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">New Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Confirm Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword || !!successMsg}
                        className="w-full btn-primary h-11 justify-center mt-6 text-sm flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-xs text-indigo-400 hover:text-indigo-300">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
