"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Create account</h1>

        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input className="w-full rounded-xl border px-4 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-xl border px-4 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border px-4 py-2" placeholder="Password (min 8)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="w-full rounded-xl border px-4 py-2" placeholder="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

          <button className="w-full rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <a className="text-blue-600 hover:underline" href="/login">Already have an account?</a>
        </div>
      </div>
    </main>
  );
}