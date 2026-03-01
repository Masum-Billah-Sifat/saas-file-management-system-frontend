"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import PublicOnly from "@/components/public-only";

export default function ResetPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    if (!token) return toast.error("Missing token");
    if (newPassword !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Password updated. Please login.");
      router.replace("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const tokenOk = Boolean(token);

  return (
    <PublicOnly>
      <main className="relative min-h-[calc(100vh-1px)] bg-white">
        {/* background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-70 animate-float" />
          <div className="absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-rose-200 via-orange-200 to-amber-200 blur-3xl opacity-60 animate-float-delayed" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-12 sm:py-16">
          <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* left info */}
            <section className="hidden rounded-3xl border bg-white/70 p-8 shadow-sm backdrop-blur lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                Reset flow
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                Set a new password
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                This page reads the token from the reset link (query param).
                Then it updates your password.
              </p>

              <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Mock flow note</p>
                <p className="mt-1 text-sm text-gray-700">
                  In production you’d email the link. Here it’s shown directly
                  after requesting it.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Bullet text="Token must be present in URL (?token=...)" />
                <Bullet text="Passwords must match before submission" />
                <Bullet text="After success, you’re redirected to login" />
              </div>
            </section>

            {/* right form */}
            <section className="rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Reset password
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Mock flow: token comes from the reset link.
                  </p>
                </div>
                <a
                  href="/"
                  className="rounded-2xl border bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  Home
                </a>
              </div>

              {/* token status */}
              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  tokenOk
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {tokenOk ? "Token detected" : "Token missing"}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {tokenOk
                    ? "You can set a new password now."
                    : "Open this page from the reset link so the token is included in the URL."}
                </p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    New password
                  </label>
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                    type="password"
                    placeholder="New password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Confirm new password
                  </label>
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                    type="password"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                <button
                  className="group inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update password"}
                  <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </form>

              <div className="mt-6 text-sm">
                <a
                  className="font-semibold text-indigo-700 hover:underline"
                  href="/login"
                >
                  Back to login
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PublicOnly>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gray-900" />
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}
