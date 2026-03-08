"use client";

import { useState } from "react";
import {
    Search, Bell, Settings, Menu,
    ChevronDown, Building2, Plus,
    Sun, Moon
} from "lucide-react";

interface TopbarProps {
    onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-[#080810]/80 backdrop-blur-md flex-shrink-0">
            {/* Left: Menu + Search */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuToggle}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
                >
                    <Menu size={18} />
                </button>

                <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'w-96' : 'w-72'}`}>
                    <Search size={16} className="absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="search-input text-sm"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    {searchFocused && (
                        <div className="absolute right-3 text-[10px] text-muted-foreground/50 font-mono">⌘K</div>
                    )}
                </div>
            </div>

            {/* Right: Company selector + actions */}
            <div className="flex items-center gap-2">
                {/* Company selector */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Building2 size={11} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">My Business</span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                <div className="w-px h-5 bg-border mx-1" />

                {/* Quick add */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/15 transition-all">
                    <Plus size={14} />
                    <span className="hidden sm:block">Quick Add</span>
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Bell size={18} />
                    <span className="notification-dot" />
                </button>

                {/* Settings */}
                <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Settings size={18} />
                </button>

                {/* Avatar */}
                <div className="avatar cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    SA
                </div>
            </div>
        </header>
    );
}
