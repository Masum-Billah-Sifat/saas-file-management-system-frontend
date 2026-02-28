"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

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

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-gray-600">Mock flow: token comes from reset link.</p>

        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input className="w-full rounded-xl border px-4 py-2" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <input className="w-full rounded-xl border px-4 py-2" type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <a className="text-blue-600 hover:underline" href="/login">Back to login</a>
        </div>
      </div>
    </main>
  );
}