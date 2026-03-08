"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [view, setView] = useState<'login' | 'forgot_password' | 'contact_admin'>('login');

    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMsg("");

        if (view === 'login') {
            try {
                const res = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                    callbackUrl
                });

                if (res?.error) {
                    setError("Correo electrónico o contraseña no válidos");
                } else {
                    router.push(callbackUrl);
                    router.refresh();
                }
            } catch {
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        } else if (view === 'forgot_password') {
            try {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (res.ok) {
                    setSuccessMsg("If an account exists, a reset link has been sent.");
                    setTimeout(() => setView('login'), 3000);
                } else {
                    const data = await res.json();
                    setError(data.error || "Failed to process request");
                }
            } catch {
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        } else if (view === 'contact_admin') {
            try {
                const res = await fetch('/api/support', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, message })
                });

                if (res.ok) {
                    setSuccessMsg("Administrator contacted successfully.");
                    setTimeout(() => {
                        setView('login');
                        setMessage("");
                    }, 3000);
                } else {
                    const data = await res.json();
                    setError(data.error || "Failed to send message");
                }
            } catch {
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 glass-card animate-fade-in-up relative z-10 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
                        <Bot size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {view === 'login' ? 'Welcome to Business OS' : view === 'forgot_password' ? 'Reset Password' : 'Contact Admin'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {view === 'login' ? 'Sign in to your control center' : view === 'forgot_password' ? 'Enter your email to receive a reset link' : 'Send a message to support'}
                    </p>
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
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-10"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    {view === 'login' && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs text-muted-foreground font-medium">Password</label>
                                <button type="button" onClick={() => { setView('forgot_password'); setError(""); setSuccessMsg(""); }} className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {view === 'contact_admin' && (
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Message</label>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-3 top-3 text-muted-foreground" />
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="input-field pl-10 min-h-[100px] resize-none"
                                    placeholder="Describe your issue..."
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email || (view === 'login' && !password) || (view === 'contact_admin' && !message)}
                        className="w-full btn-primary h-11 justify-center mt-6 text-sm flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading
                            ? "Processing..."
                            : view === 'login'
                                ? "Sign In"
                                : view === 'forgot_password'
                                    ? "Send Reset Link"
                                    : "Send Message"
                        }
                    </button>

                    {view !== 'login' && (
                        <button
                            type="button"
                            onClick={() => { setView('login'); setError(""); setSuccessMsg(""); }}
                            className="w-full btn-ghost h-11 justify-center mt-2 text-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </button>
                    )}
                </form>

                {view === 'login' && (
                    <div className="mt-6 pt-6 border-t border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">
                            Don&apos;t have an account or need help?{" "}
                            <button onClick={() => { setView('contact_admin'); setError(""); setSuccessMsg(""); }} className="text-indigo-400 hover:text-indigo-300 font-medium">Contact Administrator</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
