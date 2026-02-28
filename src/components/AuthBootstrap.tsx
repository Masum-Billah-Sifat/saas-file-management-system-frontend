"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/lib/types";

export default function AuthBootstrap() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    // No token => nothing to rehydrate
    if (!token) return;

    // If we already have user, you can still refresh silently (optional).
    // We'll refresh only if user missing.
    if (user) return;

    (async () => {
      try {
        const res = await api.get("/auth/me");
        const meUser: User = res.data.data.user;
        setUser(meUser);
      } catch (e: any) {
        // If 401 happens, axios interceptor already clears + redirects.
        // For other errors:
        const status = e?.response?.status;
        if (status && status !== 401) toast.error(e?.response?.data?.message || "Failed to load session");
        if (!status) {
          clearAuth();
          toast.error("Network error. Please login again.");
        }
      }
    })();
  }, [token, user, setUser, clearAuth]);

  return null;
}