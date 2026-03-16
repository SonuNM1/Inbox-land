"use client";
import { useState, useEffect } from "react";
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
export default function MassMail() {
  const [senderEmail, setSenderEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [toast, setToast] = useState(null);
  const sentCount = results?.filter((r) => r.status === "sent").length ?? 0;
  const failedCount = results?.filter((r) => r.status === "failed").length ?? 0;
  const recipientCount = recipients.split(/[\n,]+/).filter((e) => e.trim()).length;
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  const handleSend = async () => {
    setResults(null);
    const recipientList = recipients.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
    if (!senderEmail || !appPassword || !recipientList.length || !subject || !body) {
      setToast({ message: "Please fill in all fields.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail, appPassword, recipients: recipientList, subject, body }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ message: data.error, type: "error" });
      } else {
        setResults(data.results);
        setSenderEmail("");
        setAppPassword("");
        setRecipients("");
        setSubject("");
        setBody("");
        const sent = data.results.filter((r) => r.status === "sent").length;
        const failed = data.results.filter((r) => r.status === "failed").length;
        if (failed === 0) {
          setToast({ message: `${sent} emails sent successfully!`, type: "success" });
        } else {
          setToast({ message: `${sent} sent, ${failed} failed.`, type: "error" });
        }
      }
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 lg:p-10 ml-40 mt-20 lg:mt-20 lg:ml-40 laptop:mt-4 laptop:ml-32">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg
          ${toast.type === "success" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
          {toast.type === "success"
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}
      <div className="max-w-2xl">
        <div className="mb-8 lg:mb-8 xl:mb-8 [@media(min-width:1024px)_and_(max-width:1279px)]:mb-3">
          <p className="text-muted-foreground text-sm"></p>
        </div>
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
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-input last:border-0 bg-background hover:bg-muted/30 transition-colors">
                  {r.status === "sent"
                    ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                  <span className="text-foreground flex-1 font-mono text-xs truncate">{r.email}</span>
                  {r.error && <span className="text-destructive/70 text-xs truncate max-w-[200px]">{r.error}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 [@media(min-width:1024px)_and_(max-width:1279px)]:space-y-2.5">
            <div className="grid grid-cols-2 gap-4 [@media(min-width:1024px)_and_(max-width:1279px)]:gap-2.5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 [@media(min-width:1024px)_and_(max-width:1279px)]:mb-1">Sender Gmail</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full h-10 [@media(min-width:1024px)_and_(max-width:1279px)]:h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 [@media(min-width:1024px)_and_(max-width:1279px)]:mb-1">App Password</label>
                <input
                  type="password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder="Gmail app password"
                  className="w-full h-10 [@media(min-width:1024px)_and_(max-width:1279px)]:h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 [@media(min-width:1024px)_and_(max-width:1279px)]:mb-1">
                Recipients
                {recipientCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{recipientCount} emails</span>
                )}
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder={"client1@gmail.com\nclient2@gmail.com\nclient3@gmail.com"}
                rows={4}
                className="w-full px-3 py-2.5 [@media(min-width:1024px)_and_(max-width:1279px)]:py-1.5 [@media(min-width:1024px)_and_(max-width:1279px)]:rows-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow resize-none font-mono [&]:[@media(min-width:1024px)_and_(max-width:1279px)]:[rows='3']"
                style={{ "--laptop-rows": 3 }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 [@media(min-width:1024px)_and_(max-width:1279px)]:mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your subject line"
                className="w-full h-10 [@media(min-width:1024px)_and_(max-width:1279px)]:h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 [@media(min-width:1024px)_and_(max-width:1279px)]:mb-1">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                rows={7}
                className="w-full px-3 py-2.5 [@media(min-width:1024px)_and_(max-width:1279px)]:py-1.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full h-10 [@media(min-width:1024px)_and_(max-width:1279px)]:h-8 rounded-lg bg-primary cursor-pointer text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Emails</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}