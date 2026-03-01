"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    toast.success("Logged out");
    router.replace("/login");
  };

  return (
    <ProtectedRoute allow="ADMIN">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
         <header className="sticky top-0 z-40 border-b bg-white/75 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                <span className="font-display text-sm">A</span>
              </div>
              <div className="leading-tight">
                <div className="font-display text-base font-semibold tracking-tight">
                  Admin Panel
                </div>
                <div className="text-xs text-gray-500">
                  Manage subscription tiers & rules
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {/* Keep nav minimal (functionality unchanged) */}
              <a
                href="/"
                className="hidden rounded-2xl border bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 sm:inline-flex"
              >
                View site
              </a>

              <button
                className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
                onClick={logout}
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
        
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}