"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function AuthRedirectGate() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return; // wait for persisted state

    if (!user) return; // not logged in => stay on landing

    if (user.role === "ADMIN") router.replace("/admin");
    else router.replace("/app/files");
  }, [hasHydrated, user, router]);

  return null;
}