"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

function extractTokenFromLink(link: string) {
  try {
    const url = new URL(link);
    return url.searchParams.get("token") || "";
  } catch {
    // In case link is relative or malformed
    const m = link.match(/token=([a-f0-9]+)/i);
    return m?.[1] || "";
  }
}

export default function VerifyEmailBanner() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;
  if (user.isEmailVerified) return null;

  const requestLink = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/request-email-verification");
      const verificationLink = res.data.data.verificationLink as string | undefined;
      if (!verificationLink) {
        toast.success("Already verified");
        return;
      }
      setLink(verificationLink);
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to request verification link");
    } finally {
      setLoading(false);
    }
  };

  const verifyNow = async () => {
    const token = extractTokenFromLink(link);
    if (!token) return toast.error("Invalid verification link");

    setLoading(true);
    try {
      await api.post("/auth/verify-email", { token });
      // Refresh user quickly
      const me = await api.get("/auth/me");
      setUser(me.data.data.user);
      toast.success("Email verified");
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Your email is not verified.</p>
            <p className="text-sm text-gray-600">Verify to unlock a more trusted experience (mock verification for assessment).</p>
          </div>
          <button
            onClick={requestLink}
            disabled={loading}
            className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Requesting..." : "Verify Email (Mock)"}
          </button>
        </div>
      </div>

      <Modal open={open} title="Verify Email (Mock)" onClose={() => setOpen(false)}>
        <p className="text-sm text-gray-700">
          This is a mock verification link returned by the backend (no real email sending).
        </p>

        <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm break-all">
          {link}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Later
          </button>
          <button
            className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
            onClick={verifyNow}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Now"}
          </button>
        </div>
      </Modal>
    </>
  );
}