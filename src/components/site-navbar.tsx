"use client";

// src/components/site-navbar.tsx
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export default function SiteNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const isLoggedIn = useMemo(() => !!user, [user]);
  const role = user?.role;

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    toast.success("Logged out");
    router.replace("/login");
  };

  // Avoid UI flicker before zustand persist rehydrates
  const canRenderAuthAwareUI = hasHydrated;

  const showHomeAnchors =
    canRenderAuthAwareUI && !isLoggedIn && pathname === "/";

  const showUserNav =
    canRenderAuthAwareUI && isLoggedIn && role === "USER";

  const showAdminNav =
    canRenderAuthAwareUI && isLoggedIn && role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="group inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm transition group-hover:scale-[1.03]">
            <span className="font-display text-sm">SF</span>
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold tracking-tight">
              SaaS File Manager
              <span className="ml-2 inline-block animate-wiggle">✦</span>
            </p>
            <p className="text-xs text-gray-500">Subscription-based storage</p>
          </div>
        </a>

        {/* Middle nav (role-based) */}
        <nav className="hidden items-center gap-6 md:flex">
          {showHomeAnchors && (
            <>
              <a
                href="/#about"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                About
              </a>
              <a
                href="/#packages"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Packages
              </a>
            </>
          )}

          {showUserNav && (
            <>
              <a
                href="/app/files"
                className={`text-sm font-semibold ${
                  pathname?.startsWith("/app/files")
                    ? "text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Files
              </a>
              <a
                href="/app/subscriptions"
                className={`text-sm font-semibold ${
                  pathname?.startsWith("/app/subscriptions")
                    ? "text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Subscriptions
              </a>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* While hydrating, keep header stable but don’t show wrong buttons */}
          {!canRenderAuthAwareUI && (
            <div className="h-9 w-24 rounded-2xl bg-gray-100 animate-pulse" />
          )}

          {canRenderAuthAwareUI && !isLoggedIn && (
            <a
              className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              href="/login"
            >
              Login
            </a>
          )}

          {canRenderAuthAwareUI && (showUserNav || showAdminNav) && (
            <button
              className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
              onClick={logout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav row (only when relevant) */}
      {canRenderAuthAwareUI && (showHomeAnchors || showUserNav) && (
        <div className="border-t bg-white/70 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-2">
            {showHomeAnchors && (
              <>
                <a
                  href="/#about"
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200"
                >
                  About
                </a>
                <a
                  href="/#packages"
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200"
                >
                  Packages
                </a>
              </>
            )}

            {showUserNav && (
              <>
                <a
                  href="/app/files"
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200"
                >
                  Files
                </a>
                <a
                  href="/app/subscriptions"
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200"
                >
                  Subscriptions
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}