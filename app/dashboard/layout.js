"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Send, Users, Upload, Menu, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "Send Campaign",
    href: "/dashboard/mass-mail",
    icon: <Send className="w-4 h-4" />,
  },
  {
    label: "Sender Accounts",
    href: "/dashboard/import-senders",
    icon: <Upload className="w-4 h-4" />,
  },
  {
    label: "Recipients",
    href: "/dashboard/import-clients",
    icon: <Users className="w-4 h-4" />,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: session } = useSession();

  const username = session?.user?.name || "";
  const initial = username.charAt(0).toUpperCase();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}

      <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0D1F17] flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Gmail Launcher
            </span>
          </div>
        </div>

        {/* Profile card */}

        <div
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {initial || "U"}
            </span>
          </div>

          <span className="text-white text-sm font-medium hidden sm:block">
            {username}
          </span>

          <ChevronDown className="w-3.5 h-3.5 text-white/50" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop */}

        <aside className="hidden lg:flex w-56 border-r border-[rgba(255,255,255,0.08)] bg-[#0D1F17] flex-col py-4 px-3 shrink-0">
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest px-3 mb-3"></p>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-colors
                    ${
                      active
                        ? "bg-white text-[#0D1F17]"
                        : "text-white/50 hover:text-white hover:bg-white/06"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar — mobile overlay */}

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-20 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed top-14 left-0 bottom-0 z-20 w-56 border-r border-[rgba(255,255,255,0.08)] bg-[#0D1F17] flex flex-col py-4 px-3 lg:hidden">
              <p className="text-white/30 text-xs font-medium uppercase tracking-widest px-3 mb-3"></p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${
                          active
                            ? "bg-white text-[#0D1F17]"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
