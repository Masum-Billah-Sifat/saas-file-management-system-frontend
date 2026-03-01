"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import PublicOnly from "@/components/public-only";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(accessToken, user);
      toast.success("Logged in");

      if (user.role === "ADMIN") router.replace("/admin");
      else router.replace("/app/files");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicOnly>
      <main className="relative min-h-[calc(100vh-1px)] bg-white">
        {/* background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-70 animate-float" />
          <div className="absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-200 via-cyan-200 to-sky-200 blur-3xl opacity-60 animate-float-delayed" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-12 sm:py-16">
          <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* left info */}
            <section className="hidden rounded-3xl border bg-white/70 p-8 shadow-sm backdrop-blur lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Secure access
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Sign in to manage folders and files under your subscription
                limits. Admins can manage packages and rules.
              </p>

              <div className="mt-6 space-y-3">
                <Bullet text="Strict tier enforcement on every action" />
                <Bullet text="Admin-defined packages (Free/Silver/Gold/Diamond)" />
                <Bullet text="Upload constraints: types, size, total files, per-folder files" />
              </div>

              <div className="mt-8 rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Tip</p>
                <p className="mt-1 text-sm text-gray-700">
                  If you’re an admin, you’ll be redirected to the admin panel
                  after login.
                </p>
              </div>
            </section>

            {/* right form */}
            <section className="rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Login
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter your email and password to continue.
                  </p>
                </div>
                <a
                  href="/"
                  className="rounded-2xl border bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  Home
                </a>
              </div>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                    placeholder="Your password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  className="group inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                  <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <a
                  className="font-semibold text-indigo-700 hover:underline"
                  href="/register"
                >
                  Create account
                </a>
                <a
                  className="font-semibold text-indigo-700 hover:underline"
                  href="/forgot-password"
                >
                  Forgot password?
                </a>
              </div>

              <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Note</p>
                <p className="mt-1 text-sm text-gray-700">
                  This is a subscription-based file & folder system. Your plan
                  limits what you can create and upload.
                </p>
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
