"use client";
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Key,
  Trash2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import EditSenderModal from "@/app/components/EditSenderModal";
import { Pencil } from "lucide-react";

const PAGE_SIZE = 8;

export default function ImportSenders() {

  const [senders, setSenders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editingSender, setEditingSender] = useState(null);

  const fileRef = useRef(null);

  useEffect(() => {
    fetchSenders();
  }, []);

  const fetchSenders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/senders");
      const data = await res.json();
      setSenders(data.senders ?? []);
    } catch {
      toast.error("Failed to load senders.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = (updatedSender) => {
    setSenders((prev) =>
      prev.map((s) =>
        s.id === updatedSender.id ? { ...s, ...updatedSender } : s,
      ),
    );
    toast.success("Sender updated successfully.");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/senders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error("Failed to delete.");
        return;
      }
      setSenders((prev) => prev.filter((s) => s.id !== id));
      toast.success("Sender removed successfully.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleAddSingle = async () => {
    if (!addEmail || !addPassword) {
      toast.error("Please fill in both fields.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/senders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, appPassword: addPassword }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setSenders((prev) => [data.sender, ...prev]);
        setAddEmail("");
        setAddPassword("");
        setShowAddModal(false);
        toast.success("Sender added.");
      }
    } catch {
      toast.error("Something went wrong.");
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

      // expects columns: email, appPassword (or app_password)

      const senderList = rows
        .map((r) => ({
          email: r.email || r.Email || "",
          appPassword: r.appPassword || r.app_password || r.AppPassword || "",
        }))
        .filter((r) => r.email && r.appPassword);

      if (!senderList.length) {
        toast.error(
          "No valid rows found. Check column names: email, appPassword",
        );
        setImporting(false);
        return;
      }

      const res = await fetch("/api/senders/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senders: senderList }),
      });
      const data = await res.json();
      await fetchSenders();
      toast.success(`${data.inserted} imported, ${data.skipped} skipped.`);
    } catch {
      toast.error("Import failed.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const filtered = senders.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="min-h-full p-6 lg:p-8">

      {/* Add single modal */}

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
                  Add Sender
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:bg-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Gmail
                  </label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="sender@gmail.com"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    App Password
                  </label>
                  <input
                    type="password"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Gmail app password"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                </div>
                <button
                  onClick={handleAddSingle}
                  disabled={addLoading}
                  className="w-full h-10 rounded-lg bg-[#0D1F17] text-white cursor-pointer text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {addLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Sender"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="w-full">
        {/* Header */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight mb-1">
              Sender Accounts
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage Gmail accounts used for sending.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 h-10 px-4 rounded-lg border border-input text-foreground text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Single
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

        <div className="flex gap-4 mb-6">
          <div className="rounded-xl border border-input bg-background p-4 min-w-[160px]">
            <p className="text-muted-foreground text-xs mb-1">Total Accounts</p>
            <p className="text-foreground text-2xl font-semibold">
              {senders.length}
            </p>
          </div>
          <div className="rounded-xl border border-input bg-background p-4 min-w-[160px]">
            <p className="text-muted-foreground text-xs mb-1">
              Total Mails Sent
            </p>
            <p className="text-foreground text-2xl font-semibold">
              {senders
                .reduce((acc, s) => acc + (s.mails_sent ?? 0), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table */}

        <div className="rounded-xl border border-input overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 bg-muted/40 border-b border-input">
            <span className="col-span-1 text-xs font-medium text-muted-foreground">
              #
            </span>
            <span className="col-span-3 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Email
            </span>
            <span className="col-span-3 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="w-3 h-3" /> App Password
            </span>
            <span className="col-span-1 text-xs font-medium text-muted-foreground">
              Sent
            </span>
            <span className="col-span-3 text-xs font-medium text-muted-foreground">
              Last Used
            </span>
            <span className="col-span-1 text-xs font-medium text-muted-foreground"></span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : paginated.length === 0 ? (
            <div className="px-4 py-10 text-center text-muted-foreground text-sm">
              {search
                ? "No accounts match your search."
                : "No sender accounts yet. Import or add one."}
            </div>
          ) : (
            paginated.map((sender, i) => (
              <div
                key={sender.id}
                className="grid grid-cols-12 px-4 py-3 border-b border-input last:border-0 bg-background hover:bg-muted/20 transition-colors items-center"
              >
                {/* Row number */}

                <span className="col-span-1 text-muted-foreground text-xs">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </span>

                {/* Email */}

                <span className="col-span-3 text-foreground text-sm font-mono truncate pr-2">
                  {sender.email}
                </span>

                {/* App password — masked dots */}

                <span className="col-span-3 text-muted-foreground text-sm font-mono tracking-widest">
                  ••••••••••••
                </span>

                {/* Mails sent count */}

                <span className="col-span-1 text-foreground text-sm">
                  {(sender.mails_sent ?? 0).toLocaleString()}
                </span>

                {/* Last used / cooldown status */}

                <span className="col-span-3 text-sm">
                  {(() => {
                    if (!sender.last_used_at) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                          Never used
                        </span>
                      );
                    }
                    
                    const hoursLeft = 36 - Math.floor((Date.now() - new Date(sender.last_used_at)) / 36e5);

                    if (hoursLeft <= 0) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                          Ready
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
                        {hoursLeft}h cooldown
                      </span>
                    );
                  })()}
                </span>

                {/* Edit + Delete buttons */}

                <span className="col-span-1 flex justify-end items-center gap-1">
                  <button
                    onClick={() => setEditingSender(sender)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sender.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
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

      {/* Edit sender modal */}

      {editingSender && (
        <EditSenderModal
          sender={editingSender}
          onClose={() => setEditingSender(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
