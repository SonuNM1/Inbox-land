"use client";

import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session } = useSession();

  const router = useRouter();
  const username = session?.user?.name || "";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Username */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Username</label>

        <input
          value={username}
          readOnly
          className="w-full max-w-md h-10 px-3 rounded-md border border-input bg-background text-sm"
        />
      </div>

      {/* Password Section */}
      <div className="mb-10">
        <label className="block text-sm font-medium mb-2">Password</label>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Password is securely stored
          </span>

          <button
            onClick={() =>
              toast.info("Change password feature will be implemented soon.")
            }
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            <KeyRound size={16} />
            Change password
          </button>
        </div>
      </div>

      {/* Divider */}

      <div className="border-t pt-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/mass-mail")}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md border border-input hover:bg-muted/40 text-foreground font-semibold text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
