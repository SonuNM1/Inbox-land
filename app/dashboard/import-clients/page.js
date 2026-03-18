"use client";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Mail,
  User,
  Plus,
  X,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function ImportClients() {
  
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch {
      showToast("Failed to load clients.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {

    console.log("Deleting ID:", id);

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to delete.", "error");
        return;
      }
      setClients((prev) => prev.filter((c) => c.id !== id));
      showToast("Client removed successfully.", "success");
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  const handleAdd = async () => {
    if (!addEmail) {
      showToast("Email is required.", "error");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail }),
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, "error");
      } else {
        setClients((prev) => [data.client, ...prev]);
        setAddEmail("");
        setShowAddModal(false);
        showToast("Client added.");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);

      const clientList = rows
        .map((r) => ({
          email: r.email || r.Email || "",
        }))
        .filter((r) => r.email);
      if (!clientList.length) {
        showToast("No valid rows found. Check column name: email", "error");
        setImporting(false);
        return;
      }
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: clientList }),
      });
      const data = await res.json();
      await fetchClients();
      showToast(`${data.inserted} imported, ${data.skipped} skipped.`);
    } catch {
      showToast("Import failed.", "error");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const filtered = clients.filter((c) => {
    if (filter === "mailed") return c.mailed;
    if (filter === "pending") return !c.mailed;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handleFilter = (val) => {
    setFilter(val);
    setPage(1);
  };

  return (
    <div className="min-h-full p-4 lg:p-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg
          ${toast.type === "success" ? "bg-[#0D1F17] text-white" : "bg-destructive text-destructive-foreground"}`}
        >
          {toast.message}
        </div>
      )}

      {/* Add modal */}

      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-background rounded-xl border border-input w-full max-w-sm p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-foreground font-semibold text-base">
                  Add Client
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={addLoading}
                  className="w-full h-10 rounded-lg bg-[#0D1F17] text-white text-sm font-medium flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {addLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Client"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight mb-1">
            Client List
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage clients you want to reach out to.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 cursor-pointer hover:bg-gray-200 rounded-lg border border-input text-foreground text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Single
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 h-10 px-4 cursor-pointer rounded-lg bg-[#0D1F17] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {importing ? "Importing..." : "Import from Excel"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleExcelImport}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="rounded-xl border border-input bg-background p-4 min-w-[140px]">
          <p className="text-muted-foreground text-xs mb-1">Total Clients</p>
          <p className="text-foreground text-2xl font-semibold">
            {clients.length}
          </p>
        </div>
        <div className="rounded-xl border border-input bg-background p-4 min-w-[140px]">
          <p className="text-muted-foreground text-xs mb-1">Mailed</p>
          <p className="text-foreground text-2xl font-semibold">
            {clients.filter((c) => c.mailed).length}
          </p>
        </div>
        <div className="rounded-xl border border-input bg-background p-4 min-w-[140px]">
          <p className="text-muted-foreground text-xs mb-1">Pending</p>
          <p className="text-foreground text-2xl font-semibold">
            {clients.filter((c) => !c.mailed).length}
          </p>
        </div>
      </div>

      {/* Filter tabs */}

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 border border-input rounded-lg p-1">
          {["all", "mailed", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
          ${filter === f ? "bg-[#0D1F17] text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}

      <div className="hidden md:block rounded-xl border border-input overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-muted/40 border-b border-input">
          <span className="col-span-1 text-xs font-medium text-muted-foreground">
            #
          </span>
          <span className="col-span-7 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email
          </span>
          <span className="col-span-3 text-xs font-medium text-muted-foreground">
            Status
          </span>
          <span className="col-span-1 text-xs font-medium text-muted-foreground"></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : paginated.length === 0 ? (
          <div className="px-4 py-10 text-center text-muted-foreground text-sm">
            No clients yet. Import or add one.
          </div>
        ) : (
          paginated.map((client, i) => (
            <div
              key={client.id}
              className="grid grid-cols-12 px-4 py-3 border-b border-input last:border-0 bg-background hover:bg-muted/20 transition-colors items-center"
            >
              <span className="col-span-1 text-muted-foreground text-xs">
                {(page - 1) * PAGE_SIZE + i + 1}
              </span>
              <span className="col-span-7 text-foreground text-sm font-mono truncate pr-2">
                {client.email}
              </span>
              <span className="col-span-3">
                {client.mailed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Mailed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </span>
              <span className="col-span-1 flex justify-end">
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No clients yet. Import or add one.
          </div>
        ) : (
          paginated.map((client, i) => (
            <div
              key={client.id}
              className="rounded-xl border border-input bg-background p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground text-xs font-mono truncate mt-0.5">
                  {client.email}
                </p>
                <div className="mt-2">
                  {client.mailed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Mailed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(client.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <p className="text-muted-foreground text-xs">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-input text-foreground hover:bg-muted/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                  ${p === page ? "bg-[#0D1F17] text-white" : "border border-input text-foreground hover:bg-muted/40"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-input text-foreground hover:bg-muted/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
