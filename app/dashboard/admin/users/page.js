"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        // ✅ check res.ok too
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

  const handleDelete = () => {
    toast.info("Feature under development. Coming soon in next version.");
  };

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
            className="mt-4 h-10 px-5 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Create User
          </button>
        </div>

        {/* ── USERS TABLE ── */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="rounded-xl border border-input overflow-hidden">
            <div className="flex items-center px-4 py-2 bg-muted/50 border-b border-input text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="flex-1">Username</div>
              <div className="w-24 text-center">Role</div>
              <div className="w-20 text-right">Actions</div>
            </div>

            {users.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-4 py-3 border-b border-input last:border-0 bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 text-sm font-medium">
                    {user.username}
                  </div>
                  <div className="w-24 text-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                      {user.role}
                    </span>
                  </div>
                  <div className="w-20 flex justify-end">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
