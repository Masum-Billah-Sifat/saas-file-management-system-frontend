"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

type Props = {
  children?: React.ReactNode;
};

/**
 * Use this on pages that should be accessible ONLY when logged out:
 *  - / (landing)
 *  - /login
 *  - /register
 *  - /forgot-password
 *  - /reset-password
 *
 * If logged in:
 *  - ADMIN -> /admin
 *  - USER  -> /app/files
 */
export default function PublicOnly({ children }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (user?.role === "ADMIN") router.replace("/admin");
    else if (user?.role === "USER") router.replace("/app/files");
  }, [hasHydrated, user, router]);

  // Prevent showing page content for a split second during redirect
  if (!hasHydrated) return null;
  if (user) return null;

  return <>{children}</>;
}