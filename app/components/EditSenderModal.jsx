// Modal for editing a sender's email and app password
"use client";
import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";

export default function EditSenderModal({ sender, onClose, onSave }) {
  const [email, setEmail] = useState(sender.email);
  const [password, setPassword] = useState(sender.app_password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/senders/${sender.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, appPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update.");
        return;
      }
      onSave(data.sender); // pass updated sender back to parent
      onClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-background rounded-xl border border-input w-full max-w-sm p-6 shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-foreground font-semibold text-base">Edit Sender</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Gmail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sender@gmail.com"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
              />
            </div>

            {/* App password field with eye toggle */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">App Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Gmail app password"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inline error */}
            {error && (
              <p className="text-destructive text-xs">{error}</p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-10 rounded-lg bg-[#0D1F17] text-white cursor-pointer text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}