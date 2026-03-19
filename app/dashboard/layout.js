"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Menu, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { data: session } = useSession();
  const username = session?.user?.name || "";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0D1F17] flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            Gmail Launcher
          </span>
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}