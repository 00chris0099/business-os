import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    }).format(d);
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        active: 'text-green-400 bg-green-400/10',
        inactive: 'text-gray-400 bg-gray-400/10',
        pending: 'text-yellow-400 bg-yellow-400/10',
        completed: 'text-blue-400 bg-blue-400/10',
        cancelled: 'text-red-400 bg-red-400/10',
        draft: 'text-gray-400 bg-gray-400/10',
        paid: 'text-green-400 bg-green-400/10',
        overdue: 'text-red-400 bg-red-400/10',
        running: 'text-blue-400 bg-blue-400/10 animate-pulse',
        error: 'text-red-400 bg-red-400/10',
        success: 'text-green-400 bg-green-400/10',
        new: 'text-purple-400 bg-purple-400/10',
        qualified: 'text-blue-400 bg-blue-400/10',
        converted: 'text-green-400 bg-green-400/10',
        lost: 'text-red-400 bg-red-400/10',
    };
    return colors[status?.toLowerCase()] || 'text-gray-400 bg-gray-400/10';
}

export function generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

export function generateInvoiceNumber(): string {
    const prefix = 'INV';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${year}${month}-${random}`;
}
