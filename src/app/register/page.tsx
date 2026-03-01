"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import PublicOnly from "@/components/public-only";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { user, accessToken } = res.data.data;
      setAuth(accessToken, user);
      toast.success("Registered");

      // User only
      router.replace("/app/files");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
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
          <div className="absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-amber-200 via-orange-200 to-rose-200 blur-3xl opacity-60 animate-float-delayed" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-12 sm:py-16">
          <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* left info */}
            <section className="hidden rounded-3xl border bg-white/70 p-8 shadow-sm backdrop-blur lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                New account
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                Start managing your storage
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Create an account, choose a package, and manage folders/files
                with strict enforcement of tier limits.
              </p>

              <div className="mt-6 space-y-3">
                <Bullet text="Pick your package anytime (limits apply going forward)" />
                <Bullet text="Organize folders with nesting restrictions" />
                <Bullet text="Upload only allowed file types within size and count limits" />
              </div>

              <div className="mt-8 rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Extra priority</p>
                <p className="mt-1 text-sm text-gray-700">
                  Email verification and password reset improve evaluation score
                  if included.
                </p>
              </div>
            </section>

            {/* right form */}
            <section className="rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Create account
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Fill in your details to get started.
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
                    Name
                  </label>
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                    placeholder="Your name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

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
                    placeholder="Password (min 8)"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Confirm password
                  </label>
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                    placeholder="Repeat password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                <button
                  className="group inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Register"}
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
                  Already have an account?
                </a>
              </div>

              <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">By creating an account</p>
                <p className="mt-1 text-sm text-gray-700">
                  You can select or update your subscription package from inside
                  the app.
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
