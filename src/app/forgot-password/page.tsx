"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setResetLink(res.data.data.resetLink || null);
      toast.success("If account exists, reset link generated (mock).");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Forgot password</h1>

        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input className="w-full rounded-xl border px-4 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60" disabled={loading}>
            {loading ? "Generating..." : "Generate reset link (Mock)"}
          </button>
        </form>

        {resetLink && (
          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm break-all">
            <div className="font-medium mb-1">Reset link (mock):</div>
            <a className="text-blue-600 hover:underline" href={resetLink}>{resetLink}</a>
          </div>
        )}

        <div className="mt-4 text-sm">
          <a className="text-blue-600 hover:underline" href="/login">Back to login</a>
        </div>
      </div>
    </main>
  );
}