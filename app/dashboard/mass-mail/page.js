"use client";
import { useState } from "react";
import { Send, CheckCircle, XCircle, Loader2, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

export default function MassMail() {
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const sentCount = results?.filter((r) => r.status === "sent").length ?? 0;
  const failedCount = results?.filter((r) => r.status === "failed").length ?? 0;
  const recipientCount = recipients
    .split(/[\n,]+/)
    .filter((e) => e.trim()).length;

  const handleSend = async () => {
    setResults(null);
    const recipientList = recipients
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (
      !senderEmail ||
      !appPassword ||
      !recipientList.length ||
      !subject ||
      !body
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          appPassword,
          recipients: recipientList,
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResults(data.results);
        setSenderName("");
        setSenderEmail("");
        setAppPassword("");
        setRecipients("");
        setSubject("");
        setBody("");
        const sent = data.results.filter((r) => r.status === "sent").length;
        const failed = data.results.filter((r) => r.status === "failed").length;
        failed === 0
          ? toast.success(`${sent} emails sent successfully.`)
          : toast.error(`${sent} sent, ${failed} failed.`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-4">
      <div className="w-full max-w-2xl space-y-5 lg:space-y-3">
        {results ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                {sentCount} sent
              </div>
              {failedCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  {failedCount} failed
                </div>
              )}
              <button
                onClick={() => setResults(null)}
                className="ml-auto h-9 px-4 rounded-lg border border-input text-foreground text-sm font-medium hover:bg-muted/40 transition-colors"
              >
                New send
              </button>
            </div>
            <div className="rounded-xl border border-input overflow-hidden">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-input last:border-0 bg-background hover:bg-muted/30 transition-colors"
                >
                  {r.status === "sent" ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                  <span className="text-foreground flex-1 font-mono text-xs truncate">
                    {r.email}
                  </span>
                  {r.error && (
                    <span className="text-destructive/70 text-xs truncate max-w-[200px]">
                      {r.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 lg:space-y-2">
            {/* Your Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 lg:mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="John Carter"
                className="w-full h-10 lg:h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
              />
            </div>

            {/* Gmail + App Password */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 lg:mb-1">
                  Sender Gmail
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full h-10 lg:h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 lg:mb-1">
                  App Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    placeholder="Gmail app password"
                    className="w-full h-10 lg:h-8 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 lg:mb-1">
                Recipients
                {recipientCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {recipientCount} emails
                  </span>
                )}
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder={
                  "put client's mail here"
                }
                rows={3}
                className="w-full px-3 py-2.5 lg:py-1.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow resize-none font-mono"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 lg:mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your subject line"
                className="w-full h-10 lg:h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 lg:mb-1">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                rows={5}
                className="w-full px-3 py-2.5 lg:py-1.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow resize-none"
              />
            </div>

            {/* Send Button */}

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full h-10 lg:h-8 rounded-lg bg-primary cursor-pointer text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Emails
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
