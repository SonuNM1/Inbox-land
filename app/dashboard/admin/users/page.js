"use client";
import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Loader2,
  Trash2,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function AdminUsers() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active"); // "active" | "inactive"
  const [actionLoading, setActionLoading] = useState(null); // track which user is loading

  // TODO: replace with your actual session/auth — get current admin id

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const currentAdminId = session?.user?.id;

  // Fetch all users from backend

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users.");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create a new user
  const handleCreate = async () => {
    if (!username || !password) {
      toast.error("Username and password required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to create user");
      } else {
        toast.success("User created successfully");
        setUsername("");
        setPassword("");
        fetchUsers();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  // Deactivate a user (soft delete)
  const handleDeactivate = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate", adminId: currentAdminId }),
      });
      if (!res.ok) {
        toast.error("Failed to deactivate user.");
        return;
      }
      // Update local state instantly
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                is_active: false,
                deactivated_at: new Date().toISOString(),
                deactivated_by_name: session?.user?.name ?? "You",
              }
            : u,
        ),
      );
      toast.success("User deactivated.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reactivate a user
  const handleReactivate = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate", adminId: currentAdminId }),
      });
      if (!res.ok) {
        toast.error("Failed to reactivate user.");
        return;
      }
      // Update local state instantly
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                is_active: true,
                deactivated_at: null,
                deactivated_by_name: null,
              }
            : u,
        ),
      );
      toast.success("User reactivated.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  // Split users into active and inactive lists
  const activeUsers = users.filter((u) => u.is_active);
  const inactiveUsers = users.filter((u) => !u.is_active);
  const displayedUsers = tab === "active" ? activeUsers : inactiveUsers;

  return (
    <div className="p-6 lg:p-10 ml-40 mt-20 lg:mt-20 lg:ml-40 laptop:mt-4 laptop:ml-32">
      <div className="max-w-3xl space-y-8">
        {/* ── CREATE USER FORM ── */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Create User</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-4 h-10 px-5 rounded-lg bg-primary cursor-pointer text-primary-foreground flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Create User
          </button>
        </div>

        {/* ── USERS TABLE WITH TABS ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Users</h2>

            {/* Active / Inactive tabs */}
            <div className="flex items-center gap-1 border border-input rounded-lg p-1">
              <button
                onClick={() => setTab("active")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${tab === "active" ? "bg-[#0D1F17] text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Active
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {activeUsers.length}
                </span>
              </button>
              <button
                onClick={() => setTab("inactive")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${tab === "inactive" ? "bg-[#0D1F17] text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                Inactive
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {inactiveUsers.length}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-input overflow-hidden">
            {/* Table header */}

            <div
              className="grid px-4 py-2.5 bg-muted/50 border-b border-input text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              style={{
                gridTemplateColumns:
                  tab === "active"
                    ? "1fr 100px 140px"
                    : "1fr 100px 150px 150px 140px",
              }}
            >
              <div>Username</div>
              <div className="text-center">Role</div>
              {tab === "inactive" && (
                <>
                  <div className="text-center">Deactivated By</div>
                  <div className="text-center">Deactivated At</div>
                </>
              )}
              <div className="text-right">Actions</div>
            </div>

            {/* Empty state */}
            {displayedUsers.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                No {tab} users found.
              </div>
            ) : (
              displayedUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid px-4 py-3.5 border-b border-input last:border-0 bg-background hover:bg-muted/20 transition-colors items-center"
                  style={{
                    gridTemplateColumns:
                      tab === "active"
                        ? "1fr 100px 140px"
                        : "1fr 100px 150px 150px 140px",
                  }}
                >
                  {/* Username with avatar initial */}

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
    ${
      user.role === "admin"
        ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
        : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
    }`}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user.username}
                    </span>
                  </div>

                  {/* Role badge — centered */}
                  <div className="flex justify-center">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                        User
                      </span>
                    )}
                  </div>

                  {/* Deactivated info — only on inactive tab */}

                  {tab === "inactive" && (
                    <>
                      <div className="text-center text-xs text-muted-foreground">
                        {user.deactivated_by_name ?? "—"}
                      </div>
                      <div className="text-center text-xs text-muted-foreground">
                        {user.deactivated_at
                          ? new Date(user.deactivated_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </div>
                    </>
                  )}

                  {/* Action button */}

                  {/* Action button — only admins can deactivate/reactivate */}
                  <div className="flex justify-end">
                    {!isAdmin ? (
                      // Non-admins see nothing
                      <span className="text-xs text-muted-foreground/40">
                        —
                      </span>
                    ) : tab === "active" ? (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        disabled={actionLoading === user.id}
                        className="flex items-center cursor-pointer gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-input text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldOff className="w-3.5 h-3.5" />
                        )}
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(user.id)}
                        disabled={actionLoading === user.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-input text-muted-foreground hover:text-green-600 hover:border-green-500/30 hover:bg-green-500/5 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
