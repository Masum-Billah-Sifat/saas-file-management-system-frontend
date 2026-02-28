"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import VerifyEmailBanner from "@/components/VerifyEmailBanner";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    clearAuth();
    toast.success("Logged out");
    router.replace("/login");
  };

  return (
    <ProtectedRoute allow="USER">
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <div className="font-semibold">User Panel</div>
            <nav className="flex items-center gap-3 text-sm">
              <a className="hover:underline" href="/app/files">Files</a>
              <a className="hover:underline" href="/app/subscription">Subscription</a>
              <button className="rounded-xl border px-3 py-1 hover:bg-gray-50" onClick={logout}>Logout</button>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-4 space-y-4">
          <VerifyEmailBanner />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}