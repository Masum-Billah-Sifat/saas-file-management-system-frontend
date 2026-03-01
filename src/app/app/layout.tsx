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
        <main className="mx-auto max-w-5xl p-4 space-y-4">
          <VerifyEmailBanner />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}