"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/lib/types";

export default function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Role;
}) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hasHydrated) return; // wait

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== allow) {
      router.replace("/login");
      return;
    }
  }, [hasHydrated, token, user, allow, router]);

  // While hydrating, render nothing (or a loader)
  if (!hasHydrated) return null;

  // After hydration, enforce rules
  if (!token) return null;
  if (!user) return null;
  if (user.role !== allow) return null;

  return <>{children}</>;
}