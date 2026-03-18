"use client";

import { useState } from "react";
import { Mail, ArrowRight, Send, Inbox } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const FlowNode = ({ icon, label, active = false }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center ${active ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent/60"} transition-colors`}
    >
      {icon}
    </div>
    <span className="text-accent/50 text-xs font-medium">{label}</span>
  </div>
);

const FlowArrow = () => (
  <div className="flex-1 flex items-center justify-center -mt-5">
    <div className="w-full h-px bg-accent/20 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-accent/20 rotate-45 -mr-0.5" />
    </div>
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid username or password."
          : result.error,
      );
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}

      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle grid pattern */}

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--accent)) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Logo */}

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent" />
          </div>
          <span className="text-accent font-semibold text-lg tracking-tight">
            Gmail Launcher
          </span>
        </div>

        {/* Center content */}

        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-8">
          {/* Flow diagram */}

          <div className="mb-16">
            <div className="flex items-center gap-4">
              <FlowNode icon={<Send className="w-5 h-5" />} label="Sender" />
              <FlowArrow />
              <FlowNode
                icon={<Mail className="w-5 h-5" />}
                label="Gmail SMTP"
              />
              <FlowArrow />
              <FlowNode
                icon={<Inbox className="w-5 h-5" />}
                label="Inbox"
                active
              />
            </div>
          </div>

          {/* Headline */}

          <h1 className="text-primary-foreground text-[2.75rem] leading-[1.1] font-bold tracking-tight mb-4">
            Send smarter.
            <br />
            Land in inbox.
          </h1>
          <p className="text-accent/60 text-lg max-w-sm leading-relaxed">
            Cold outreach that respects deliverability. Throttled sends, warm-up
            friendly, built for teams.
          </p>
        </div>

        {/* Bottom */}

        <div className="relative z-10">
          <p className="text-accent/30 text-sm">
            © 2026 Gmail Launcher · Internal Tool
          </p>
        </div>
      </div>

      {/* Right Panel */}

      <div className="w-full lg:w-1/2 bg-background flex flex-col">
        {/* Mobile logo */}

        <div className="lg:hidden p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground font-semibold text-lg tracking-tight">
            Gmail Launcher
          </span>
        </div>

        {/* Form */}

        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-20">
          <div className="w-full max-w-sm">
            <h2 className="text-foreground text-2xl font-semibold tracking-tight mb-1">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Sign in to your account to continue
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                />
              </div>

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full h-10 rounded-lg cursor-pointer bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 cursor-pointer border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom note */}

        <div className="p-6 text-center">
          <p className="text-muted-foreground text-xs">
            Internal access only · No registration available
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
