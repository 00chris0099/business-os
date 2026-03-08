"use client";

import { useState, useEffect } from "react";
import {
    ShoppingBag, Package, FileText, DollarSign, Users,
    Plus, Search, MoreHorizontal, ChevronLeft, ChevronRight,
    TrendingUp, AlertTriangle, X, Truck
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    unit_price: number;
    currency: string;
    stock_quantity: number;
    reorder_level: number;
    is_active: boolean;
}

interface Order {
    id: string;
    order_number: string;
    type: string;
    status: string;
    total: number;
    currency: string;
    client_name: string;
    created_at: string;
}

const tabs = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "expenses", label: "Expenses", icon: DollarSign },
];

export default function ERPPage() {
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
    const [showProductModal, setShowProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "", unit_price: "", currency: "USD" });

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/erp/orders?page=${page}&limit=20`);
            const data = await res.json();
            setOrders(data.data || []);
            setPagination(data.pagination || {});
        } catch { } finally { setLoading(false); }
    };

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "20", ...(search && { search }) });
            const res = await fetch(`/api/erp/products?${params}`);
            const data = await res.json();
            setProducts(data.data || []);
            setPagination(data.pagination || {});
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => {
        if (activeTab === "orders") fetchOrders(1);
        else if (activeTab === "products") fetchProducts(1);
        else setLoading(false);
    }, [activeTab, search]);

    const handleAddProduct = async () => {
        try {
            const res = await fetch("/api/erp/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newProduct, unit_price: parseFloat(newProduct.unit_price) }),
            });
            if (res.ok) {
                setShowProductModal(false);
                setNewProduct({ name: "", sku: "", category: "", unit_price: "", currency: "USD" });
                fetchProducts(1);
            }
        } catch { }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-blue-500/10 border-blue-500/20">
                            <ShoppingBag size={18} className="text-blue-400" />
                        </span>
                        ERP
                    </h1>
                    <p className="page-subtitle mt-1">Manage inventory, orders, invoices, and financial operations</p>
                </div>
                <button onClick={() => setShowProductModal(true)} className="btn-primary">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Active Orders", value: "156", icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Products", value: "843", icon: Package, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { label: "Monthly Revenue", value: "$108K", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
                    { label: "Low Stock Items", value: "23", icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
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

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="glass-card">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-9 w-64 text-sm"
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">{pagination.total} total records</span>
                </div>

                {loading ? (
                    <div className="p-8 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-14 shimmer rounded-lg" />
                        ))}
                    </div>
                ) : activeTab === "orders" ? (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th><th>Client</th><th>Type</th>
                                    <th>Status</th><th>Total</th><th>Date</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                                        <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No orders found</p>
                                    </td></tr>
                                ) : orders.map((order) => (
                                    <tr key={order.id}>
                                        <td><span className="font-mono text-xs text-primary">{order.order_number}</span></td>
                                        <td className="text-sm">{order.client_name || "—"}</td>
                                        <td>
                                            <span className={`status-badge ${order.type === 'sale' ? 'bg-green-400/10 text-green-400' : 'bg-blue-400/10 text-blue-400'}`}>
                                                {order.type}
                                            </span>
                                        </td>
                                        <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td className="font-semibold text-foreground">{formatCurrency(order.total, order.currency)}</td>
                                        <td className="text-xs text-muted-foreground">{formatDate(order.created_at)}</td>
                                        <td><button className="p-1.5 rounded hover:bg-muted text-muted-foreground"><MoreHorizontal size={14} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === "products" ? (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>SKU</th><th>Product</th><th>Category</th>
                                    <th>Price</th><th>Stock</th><th>Status</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                                        <Package size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No products found. Add your first product!</p>
                                    </td></tr>
                                ) : products.map((product) => (
                                    <tr key={product.id}>
                                        <td><span className="font-mono text-xs text-muted-foreground">{product.sku || "—"}</span></td>
                                        <td className="font-medium text-sm">{product.name}</td>
                                        <td className="text-sm text-muted-foreground">{product.category || "—"}</td>
                                        <td className="font-semibold text-foreground">{formatCurrency(product.unit_price, product.currency)}</td>
                                        <td>
                                            <span className={`text-sm font-medium ${Number(product.stock_quantity) <= Number(product.reorder_level) ? 'text-red-400' : 'text-green-400'}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${product.is_active ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'}`}>
                                                {product.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td><button className="p-1.5 rounded hover:bg-muted text-muted-foreground"><MoreHorizontal size={14} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <FileText size={48} className="mb-4 opacity-30" />
                        <p className="text-sm font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module</p>
                        <p className="text-xs mt-1">Data will appear here once you start adding records</p>
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => activeTab === "orders" ? fetchOrders(pagination.page - 1) : fetchProducts(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <button
                                onClick={() => activeTab === "orders" ? fetchOrders(pagination.page + 1) : fetchProducts(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="glass-card w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Add New Product</h2>
                            <button onClick={() => setShowProductModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: "name", label: "Product Name *", placeholder: "Wireless Headphones" },
                                { key: "sku", label: "SKU", placeholder: "WH-001" },
                                { key: "category", label: "Category", placeholder: "Electronics" },
                                { key: "unit_price", label: "Unit Price *", placeholder: "99.99", type: "number" },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{field.label}</label>
                                    <input
                                        className="input-field"
                                        type={field.type || "text"}
                                        placeholder={field.placeholder}
                                        value={newProduct[field.key as keyof typeof newProduct]}
                                        onChange={(e) => setNewProduct({ ...newProduct, [field.key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowProductModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleAddProduct} className="btn-primary" disabled={!newProduct.name || !newProduct.unit_price}>
                                <Plus size={15} /> Add Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
