"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Bot,
    Zap,
    BarChart3,
    Database,
    Server,
    Settings,
    ChevronLeft,
    ChevronRight,
    Building2,
    TrendingUp,
    Package,
    FileText,
    Brain,
    Activity,
    Shield,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        section: "Overview",
        items: [
            { href: "/", label: "Dashboard", icon: LayoutDashboard },
        ],
    },
    {
        section: "Business",
        items: [
            { href: "/crm", label: "CRM", icon: Users },
            { href: "/erp", label: "ERP", icon: ShoppingBag },
        ],
    },
    {
        section: "Intelligence",
        items: [
            { href: "/ai-agents", label: "AI Agents", icon: Bot },
            { href: "/automation", label: "Automation", icon: Zap },
        ],
    },
    {
        section: "Insights",
        items: [
            { href: "/analytics", label: "Analytics", icon: BarChart3 },
        ],
    },
    {
        section: "Infrastructure",
        items: [
            { href: "/database", label: "Database Admin", icon: Database },
            { href: "/monitoring", label: "Monitoring", icon: Server },
        ],
    },
    {
        section: "System",
        items: [
            { href: "/companies", label: "Companies", icon: Building2 },
            { href: "/users", label: "Users & Roles", icon: Shield },
            { href: "/settings", label: "Settings", icon: Settings },
        ],
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r border-border bg-[#080810] transition-all duration-300 ease-in-out",
                collapsed ? "w-[68px]" : "w-[240px]"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 h-16 px-4 border-b border-border flex-shrink-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    <Brain className="w-4.5 h-4.5 text-white" size={18} />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in-up overflow-hidden">
                        <div className="text-sm font-bold text-white leading-tight">Business OS</div>
                        <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AI Platform</div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navItems.map((section) => (
                    <div key={section.section} className="mb-4">
                        {!collapsed && (
                            <div className="px-3 mb-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                                    {section.section}
                                </span>
                            </div>
                        )}
                        {collapsed && <div className="h-px bg-border/40 mx-2 mb-3" />}
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "sidebar-nav-item group relative",
                                        active && "active",
                                        collapsed && "justify-center px-2"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon
                                        className={cn(
                                            "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                                            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                        size={18}
                                    />
                                    {!collapsed && (
                                        <span className={cn(
                                            "text-sm transition-colors",
                                            active ? "text-white" : ""
                                        )}>
                                            {item.label}
                                        </span>
                                    )}
                                    {active && !collapsed && (
                                        <div className="ml-auto w-1 h-4 rounded-full bg-primary" />
                                    )}
                                    {collapsed && (
                                        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="p-3 border-t border-border">
                {!collapsed ? (
                    <button onClick={() => signOut()} className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors text-left group">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                                {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-foreground truncate">{session?.user?.name || "User"}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{session?.user?.email || "user@businessos.com"}</div>
                            </div>
                        </div>
                        <LogOut size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </button>
                ) : (
                    <button onClick={() => signOut()} className="w-full flex justify-center hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <div className="avatar w-7 h-7 text-[10px]">
                            {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                    </button>
                )}
            </div>

            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0d0d1a] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all z-10 shadow-lg"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </aside>
    );
}
