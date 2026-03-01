"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { endpoints, Package, SubscriptionRow } from "@/lib/endpoints";
import { useAuthStore } from "@/store/auth.store";

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);

  const [packages, setPackages] = useState<Package[]>([]);
  const [history, setHistory] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetPkg, setTargetPkg] = useState<Package | null>(null);

  const activePkg = useMemo(() => history.find((h) => h.endAt === null)?.pkg || null, [history]);

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
      toast.error(e?.response?.data?.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold">Subscription</h1>
        <p className="mt-1 text-sm text-gray-600">
          View packages and switch your active plan. Existing data will not be deleted.
        </p>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <div className="text-sm text-gray-700">
            <div className="font-medium">Current user:</div>
            <div>{user?.name} ({user?.email})</div>
          </div>

          <div className="mt-3 text-sm">
            <span className="font-medium">Active plan:</span>{" "}
            {activePkg ? (
              <span className="rounded-lg bg-white px-2 py-1 border">{activePkg.name}</span>
            ) : (
              <span className="text-gray-600">Loading...</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Available packages</h2>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => (
            <div key={p.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.name}</div>
                {activePkg?.id === p.id && (
                  <span className="text-xs rounded-full bg-black text-white px-2 py-1">Active</span>
                )}
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>Max folders: {p.maxFolders}</div>
                <div>Nesting: {p.maxNestingLevel}</div>
                <div>Max size: {p.maxFileSizeMB} MB</div>
                <div>Total files: {p.totalFileLimit}</div>
                <div>Files/folder: {p.filesPerFolder}</div>
              </div>
              <div className="mt-2 text-xs text-gray-500 break-words">
                Allowed: {p.allowedTypes.join(", ")}
              </div>

              <button
                className="mt-4 w-full rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                disabled={activePkg?.id === p.id}
                onClick={() => openSwitch(p)}
              >
                {activePkg?.id === p.id ? "Current plan" : "Switch to this plan"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">History (bonus)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2">Plan</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="py-2 font-medium">{h.pkg.name}</td>
                  <td className="py-2">{new Date(h.startAt).toLocaleString()}</td>
                  <td className="py-2">{h.endAt ? new Date(h.endAt).toLocaleString() : "Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={confirmOpen} title="Confirm plan change" onClose={() => setConfirmOpen(false)}>
        <p className="text-sm text-gray-700">
          Switch to <span className="font-semibold">{targetPkg?.name}</span>? New limits will apply going forward.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button className="rounded-xl border px-4 py-2 hover:bg-gray-50" onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
          <button className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90" onClick={confirmSwitch}>
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}