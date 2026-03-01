"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { endpoints, Package, SubscriptionRow } from "@/lib/endpoints";
import { useAuthStore } from "@/store/auth.store";

function badgeClass(active: boolean) {
  return active
    ? "bg-gray-900 text-white"
    : "bg-gray-100 text-gray-700";
}

function typePills(types: string[]) {
  // UI-only prettifier (keeps same content)
  return (types || []).map((t) => t.toUpperCase());
}

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);

  const [packages, setPackages] = useState<Package[]>([]);
  const [history, setHistory] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetPkg, setTargetPkg] = useState<Package | null>(null);

  const activePkg = useMemo(
    () => history.find((h) => h.endAt === null)?.pkg || null,
    [history],
  );

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, hRes] = await Promise.all([
        endpoints.userPackages(),
        endpoints.subscriptionHistory(),
      ]);
      setPackages(pRes.data.data || []);
      setHistory(hRes.data.data || []);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Failed to load subscription data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openSwitch = (pkg: Package) => {
    setTargetPkg(pkg);
    setConfirmOpen(true);
  };

  const confirmSwitch = async () => {
    if (!targetPkg) return;
    try {
      await endpoints.activateSubscription(targetPkg.id);
      toast.success(`Switched to ${targetPkg.name}`);
      setConfirmOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to switch plan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top / overview */}
      <section className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-200 via-cyan-200 to-sky-200 blur-3xl opacity-50" />
        </div>

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-gray-700 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Subscription
            </div>

            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Manage your plan
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
              View packages and switch your active plan. New limits apply going forward—existing data is not deleted.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              onClick={load}
            >
              Refresh
            </button>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-2">
          {/* User card */}
          <div className="rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold text-gray-500">Current user</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {user?.name || "—"}
            </p>
            <p className="mt-1 text-sm text-gray-700">{user?.email || "—"}</p>

            <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">Active plan</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {activePkg ? (
                  <>
                    <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                      {activePkg.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      Limits enforced on all actions
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-600">
                    {loading ? "Loading..." : "No active plan found"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Explanation card */}
          <div className="rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold text-gray-500">How switching works</p>
            <div className="mt-3 space-y-3">
              <Bullet text="Switching applies to future actions; existing folders/files remain." />
              <Bullet text="Folder creation checks max folders and max nesting depth." />
              <Bullet text="Uploads check file type, max size, total file cap, and per-folder cap." />
            </div>

            <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500">Bonus</p>
              <p className="mt-1 text-sm text-gray-700">
                Package history (which plan was active on which dates) is tracked below.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Available packages
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose a tier that matches your storage needs.
            </p>
          </div>

          {activePkg && (
            <div className="text-xs text-gray-500">
              Current:{" "}
              <span className="font-semibold text-gray-900">{activePkg.name}</span>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => {
            const isActive = activePkg?.id === p.id;
            const types = typePills(p.allowedTypes || []);
            return (
              <div
                key={p.id}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive ? "ring-2 ring-gray-900/10" : ""
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />

                <div className="mt-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-gray-500">Tier limits</p>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(isActive)}`}>
                    {isActive ? "Active" : "Available"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-800">
                  <Row label="Max folders" value={p.maxFolders} />
                  <Row label="Max nesting" value={p.maxNestingLevel} />
                  <Row label="Max upload" value={`${p.maxFileSizeMB} MB`} />
                  <Row label="Total files" value={p.totalFileLimit} />
                  <Row label="Files/folder" value={p.filesPerFolder} />
                </div>

                <div className="mt-4 rounded-2xl border bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-700">Allowed types</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {types.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                  disabled={isActive}
                  onClick={() => openSwitch(p)}
                >
                  {isActive ? "Current plan" : "Switch to this plan"}
                  {!isActive && (
                    <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                      →
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              History (bonus)
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Which package was active on which dates.
            </p>
          </div>
          <span className="text-xs text-gray-500">
            Rows: <span className="font-semibold text-gray-900">{history.length}</span>
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-3xl border">
          <table className="min-w-[620px] w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr className="border-b">
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((h) => {
                const isActive = h.endAt === null;
                return (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{h.pkg.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(h.startAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {h.endAt ? new Date(h.endAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isActive ? "Active" : "Ended"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {history.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-600" colSpan={4}>
                    No history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirm modal */}
      <Modal open={confirmOpen} title="Confirm plan change" onClose={() => setConfirmOpen(false)}>
        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            Switch to <span className="font-semibold text-gray-900">{targetPkg?.name}</span>?
            New limits will apply going forward (existing data will not be deleted).
          </p>

          {targetPkg && (
            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600">New plan limits</p>
              <div className="mt-2 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
                <RowCompact label="Max folders" value={targetPkg.maxFolders} />
                <RowCompact label="Max nesting" value={targetPkg.maxNestingLevel} />
                <RowCompact label="Max size" value={`${targetPkg.maxFileSizeMB} MB`} />
                <RowCompact label="Total files" value={targetPkg.totalFileLimit} />
                <RowCompact label="Files/folder" value={targetPkg.filesPerFolder} />
              </div>
              <p className="mt-3 text-xs text-gray-600 break-words">
                Allowed: <span className="font-semibold text-gray-800">{(targetPkg.allowedTypes || []).join(", ")}</span>
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
              onClick={confirmSwitch}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
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

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function RowCompact({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}