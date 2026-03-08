"use client";

import { useState, useEffect } from "react";
import {
    Database, ChevronRight, RefreshCw, Play,
    Table2, Columns, Code, ChevronDown, Search, X,
    AlertCircle, CheckCircle2, Loader2, Copy
} from "lucide-react";

interface Schema {
    schema_name: string;
}

interface TableInfo {
    table_name: string;
    table_schema: string;
    size: string;
    column_count: number;
}

interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string;
}

const DEFAULT_QUERIES = [
    { label: "All Companies", sql: "SELECT * FROM companies LIMIT 50" },
    { label: "Active Users", sql: "SELECT id, email, first_name, last_name, created_at FROM system.users LIMIT 50" },
    { label: "CRM Clients", sql: "SELECT * FROM crm.clients ORDER BY created_at DESC LIMIT 50" },
    { label: "AI Agents", sql: "SELECT * FROM ai.ai_agents ORDER BY created_at DESC" },
    { label: "DB Size", sql: "SELECT pg_size_pretty(pg_database_size(current_database())) as database_size" },
    { label: "Table Sizes", sql: "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size, n_live_tup as rows FROM pg_stat_user_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 20" },
];

export default function DatabasePage() {
    const [schemas, setSchemas] = useState<Schema[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
    const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
    const [columns, setColumns] = useState<ColumnInfo[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
    const [sql, setSql] = useState("");
    const [queryResult, setQueryResult] = useState<Record<string, unknown>[] | null>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [queryDuration, setQueryDuration] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"browser" | "query">("browser");

    useEffect(() => {
        const fetchSchemas = async () => {
            try {
                const res = await fetch("/api/db/schemas");
                const data = await res.json();
                setSchemas(data.data || []);
            } catch { }
        };
        fetchSchemas();
    }, []);

    const fetchTables = async (schema: string) => {
        try {
            const res = await fetch(`/api/db/tables?schema=${schema}`);
            const data = await res.json();
            setTables(data.data || []);
            setSelectedTable(null);
            setTableData([]);
        } catch { }
    };

    const fetchTableData = async (table: TableInfo, page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/db/data?schema=${table.table_schema}&table=${table.table_name}&page=${page}&limit=50`);
            const data = await res.json();
            setTableData(data.data || []);
            setColumns(data.columns || []);
            setPagination(data.pagination || {});
        } catch { } finally { setLoading(false); }
    };

    const runQuery = async () => {
        setLoading(true);
        setQueryResult(null);
        setQueryError(null);
        try {
            const res = await fetch("/api/db/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sql }),
            });
            const data = await res.json();
            if (!res.ok) {
                setQueryError(data.error);
            } else {
                setQueryResult(data.data);
                setQueryDuration(data.duration);
            }
        } catch (e: unknown) {
            setQueryError(e instanceof Error ? e.message : "Query failed");
        } finally { setLoading(false); }
    };

    const handleSchemaClick = (schema: string) => {
        setSelectedSchema(schema === selectedSchema ? null : schema);
        if (schema !== selectedSchema) fetchTables(schema);
    };

    const handleTableClick = (table: TableInfo) => {
        setSelectedTable(table);
        fetchTableData(table);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <span className="module-icon bg-orange-500/10 border-orange-500/20">
                            <Database size={18} className="text-orange-400" />
                        </span>
                        Database Admin
                    </h1>
                    <p className="page-subtitle mt-1">Browse schemas, tables, and run SQL queries</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView("browser")}
                        className={view === "browser" ? "btn-primary text-xs" : "btn-secondary text-xs"}
                    >
                        <Table2 size={13} /> Browser
                    </button>
                    <button
                        onClick={() => setView("query")}
                        className={view === "query" ? "btn-primary text-xs" : "btn-secondary text-xs"}
                    >
                        <Code size={13} /> SQL Editor
                    </button>
                </div>
            </div>

            {view === "browser" ? (
                <div className="grid grid-cols-[280px_1fr] gap-4 h-[calc(100vh-220px)]">
                    {/* Schema/Table Browser */}
                    <div className="glass-card overflow-y-auto">
                        <div className="p-3 border-b border-border">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schemas & Tables</h3>
                        </div>
                        <div className="p-2">
                            {schemas.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground text-xs">
                                    <Database size={24} className="mx-auto mb-2 opacity-30" />
                                    Connecting to database...
                                </div>
                            ) : (
                                schemas.map((schema) => (
                                    <div key={schema.schema_name} className="mb-1">
                                        <button
                                            onClick={() => handleSchemaClick(schema.schema_name)}
                                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted text-sm transition-colors text-left"
                                        >
                                            <Database size={14} className="text-orange-400 flex-shrink-0" />
                                            <span className="flex-1 font-medium text-foreground text-xs">{schema.schema_name}</span>
                                            <ChevronRight
                                                size={13}
                                                className={`text-muted-foreground transition-transform ${selectedSchema === schema.schema_name ? "rotate-90" : ""}`}
                                            />
                                        </button>
                                        {selectedSchema === schema.schema_name && (
                                            <div className="ml-4 mt-1 space-y-0.5">
                                                {tables.map((table) => (
                                                    <button
                                                        key={table.table_name}
                                                        onClick={() => handleTableClick(table)}
                                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${selectedTable?.table_name === table.table_name
                                                                ? "bg-primary/15 text-primary"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            }`}
                                                    >
                                                        <Table2 size={11} className="flex-shrink-0" />
                                                        <span className="flex-1">{table.table_name}</span>
                                                        <span className="text-[10px] opacity-60">{table.size}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="glass-card overflow-hidden flex flex-col">
                        {selectedTable ? (
                            <>
                                <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground font-mono">
                                            {selectedTable.table_schema}.{selectedTable.table_name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {pagination.total} rows · {selectedTable.size} · {selectedTable.column_count} columns
                                        </p>
                                    </div>
                                    <button onClick={() => fetchTableData(selectedTable)} className="btn-secondary text-xs">
                                        <RefreshCw size={12} /> Refresh
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-auto">
                                        {tableData.length === 0 ? (
                                            <div className="text-center py-16 text-muted-foreground">
                                                <Table2 size={40} className="mx-auto mb-3 opacity-30" />
                                                <p className="text-sm">Table is empty</p>
                                            </div>
                                        ) : (
                                            <table className="data-table text-xs w-full">
                                                <thead className="sticky top-0 z-10">
                                                    <tr>
                                                        {columns.map((col) => (
                                                            <th key={col.column_name} className="whitespace-nowrap">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span>{col.column_name}</span>
                                                                    <span className="text-[9px] font-normal text-muted-foreground/60 normal-case tracking-normal">
                                                                        {col.data_type}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData.map((row, idx) => (
                                                        <tr key={idx}>
                                                            {columns.map((col) => {
                                                                const val = row[col.column_name];
                                                                const display = val === null ? "NULL" :
                                                                    typeof val === "object" ? JSON.stringify(val).substring(0, 80) :
                                                                        String(val).substring(0, 100);
                                                                return (
                                                                    <td key={col.column_name} className="font-mono text-xs whitespace-nowrap max-w-[200px] truncate"
                                                                        title={String(val ?? "")}>
                                                                        {val === null ? (
                                                                            <span className="text-muted-foreground/40 italic">null</span>
                                                                        ) : (
                                                                            <span>{display}</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between p-3 border-t border-border flex-shrink-0">
                                        <span className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => fetchTableData(selectedTable!, pagination.page - 1)}
                                                disabled={pagination.page === 1} className="btn-secondary text-xs py-1 px-2 disabled:opacity-50">
                                                Prev
                                            </button>
                                            <button onClick={() => fetchTableData(selectedTable!, pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages} className="btn-secondary text-xs py-1 px-2 disabled:opacity-50">
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <Database size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">Select a table to browse data</p>
                                <p className="text-xs mt-1">Click on a schema and table in the left panel</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* SQL Editor */
                <div className="space-y-4">
                    {/* Quick queries */}
                    <div className="glass-card p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Queries</p>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_QUERIES.map((q) => (
                                <button
                                    key={q.label}
                                    onClick={() => setSql(q.sql)}
                                    className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent border border-border transition-all"
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SQL Input */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SQL Query</p>
                            <div className="flex gap-2">
                                <button onClick={() => { setSql(""); setQueryResult(null); setQueryError(null); }}
                                    className="btn-ghost text-xs">
                                    <X size={12} /> Clear
                                </button>
                                <button onClick={runQuery} disabled={!sql.trim() || loading}
                                    className="btn-primary text-xs disabled:opacity-50">
                                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                                    Run Query
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={sql}
                            onChange={(e) => setSql(e.target.value)}
                            className="w-full h-48 code-block resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-black/30 text-green-400"
                            placeholder="SELECT * FROM companies LIMIT 10;"
                            spellCheck={false}
                            onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runQuery();
                            }}
                        />
                        <p className="text-[10px] text-muted-foreground mt-2">Press Ctrl+Enter to run</p>
                    </div>

                    {/* Results */}
                    {queryError && (
                        <div className="glass-card p-4 border-red-500/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-400">Query Error</p>
                                    <p className="text-xs text-muted-foreground mt-1 font-mono">{queryError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {queryResult && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={15} className="text-green-400" />
                                    <span className="text-sm font-medium text-foreground">{queryResult.length} rows returned</span>
                                    {queryDuration !== null && (
                                        <span className="text-xs text-muted-foreground">in {queryDuration}ms</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(queryResult, null, 2))}
                                    className="btn-ghost text-xs"
                                >
                                    <Copy size={12} /> Copy JSON
                                </button>
                            </div>
                            <div className="overflow-auto max-h-[400px]">
                                {queryResult.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm">Query executed successfully with no results</div>
                                ) : (
                                    <table className="data-table text-xs w-full">
                                        <thead className="sticky top-0">
                                            <tr>
                                                {Object.keys(queryResult[0]).map((col) => (
                                                    <th key={col} className="whitespace-nowrap">{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queryResult.map((row, idx) => (
                                                <tr key={idx}>
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="font-mono text-xs max-w-[300px] truncate whitespace-nowrap">
                                                            {val === null ? (
                                                                <span className="text-muted-foreground/40 italic">null</span>
                                                            ) : typeof val === "object" ? (
                                                                <span className="text-blue-400">{JSON.stringify(val).substring(0, 100)}</span>
                                                            ) : (
                                                                String(val).substring(0, 150)
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
