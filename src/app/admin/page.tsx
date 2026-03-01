"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { endpoints, Package } from "@/lib/endpoints";

const emptyForm = {
  name: "",
  maxFolders: 10,
  maxNestingLevel: 3,
  allowedTypes: ["IMAGE", "PDF"],
  maxFileSizeMB: 5,
  totalFileLimit: 20,
  filesPerFolder: 10,
  isActive: true,
};

export default function AdminDashboard() {
  const [list, setList] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((p) => p.isActive).length;
    const system = list.filter((p) => p.isSystem).length;
    return { total, active, system };
  }, [list]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await endpoints.adminPackages();
      setList(res.data.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Package) => {
    setEditing(p);
    setForm({
      name: p.name,
      maxFolders: p.maxFolders,
      maxNestingLevel: p.maxNestingLevel,
      allowedTypes: p.allowedTypes,
      maxFileSizeMB: p.maxFileSizeMB,
      totalFileLimit: p.totalFileLimit,
      filesPerFolder: p.filesPerFolder,
      isActive: p.isActive,
    });
    setOpen(true);
  };

  const submit = async () => {
    try {
      if (editing) {
        await endpoints.adminUpdatePackage(editing.id, form);
        toast.success("Package updated");
      } else {
        await endpoints.adminCreatePackage(form);
        toast.success("Package created");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    }
  };

  const deactivate = async (p: Package) => {
    if (!confirm("Deactivate this package?")) return;
    try {
      await endpoints.adminDeactivatePackage(p.id);
      toast.success("Package deactivated");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const toggleAllowed = (t: string) => {
    setForm((prev: any) => {
      const set = new Set(prev.allowedTypes);
      if (set.has(t)) set.delete(t);
      else set.add(t);
      return { ...prev, allowedTypes: Array.from(set) };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top header card */}
      <section className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-200 via-cyan-200 to-sky-200 blur-3xl opacity-50" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-gray-700 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Package Management
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Admin: Subscription Packages
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
              Manage packages and limits. System package (e.g., Free) is protected. Enforcement happens across all user actions.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
              onClick={openCreate}
            >
              + Create package
            </button>
            <div className="text-xs text-gray-500">
              Total: <span className="font-semibold text-gray-900">{stats.total}</span> · Active:{" "}
              <span className="font-semibold text-gray-900">{stats.active}</span> · System:{" "}
              <span className="font-semibold text-gray-900">{stats.system}</span>
            </div>
          </div>
        </div>
      </section>

      {/* List card */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold tracking-tight">Packages</p>
          <button
            className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
            onClick={load}
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="mt-4 rounded-2xl border bg-gray-50 p-4 text-sm text-gray-600">
            Loading packages…
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="mt-4 rounded-2xl border bg-gray-50 p-6">
            <p className="text-sm font-semibold text-gray-900">No packages found</p>
            <p className="mt-1 text-sm text-gray-700">
              Create a package to start defining subscription limits.
            </p>
            <button
              className="mt-4 rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
              onClick={openCreate}
            >
              + Create package
            </button>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />

              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold">{p.name}</p>
                    {p.isSystem && (
                      <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">
                        System
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Tier rules used for enforcement
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    p.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-800">
                <Row label="Max folders" value={p.maxFolders} />
                <Row label="Max nesting" value={p.maxNestingLevel} />
                <Row label="Max file size" value={`${p.maxFileSizeMB} MB`} />
                <Row label="Total files" value={p.totalFileLimit} />
                <Row label="Files / folder" value={p.filesPerFolder} />
              </div>

              <div className="mt-4 rounded-2xl border bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700">Allowed types</p>
                <p className="mt-1 text-xs text-gray-600">
                  {p.allowedTypes.join(", ")}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                  onClick={() => openEdit(p)}
                >
                  Edit
                </button>

                <button
                  className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
                  onClick={() => deactivate(p)}
                  disabled={p.isSystem || !p.isActive}
                  title={p.isSystem ? "System packages cannot be deactivated" : ""}
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      <Modal
        open={open}
        title={editing ? "Edit package" : "Create package"}
        onClose={() => setOpen(false)}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">Package name</label>
            <input
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
              placeholder="e.g., Gold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Max folders"
              value={form.maxFolders}
              onChange={(v) => setForm({ ...form, maxFolders: v })}
            />
            <Field
              label="Max nesting level"
              value={form.maxNestingLevel}
              onChange={(v) => setForm({ ...form, maxNestingLevel: v })}
            />
            <Field
              label="Max file size (MB)"
              value={form.maxFileSizeMB}
              onChange={(v) => setForm({ ...form, maxFileSizeMB: v })}
            />
            <Field
              label="Total file limit"
              value={form.totalFileLimit}
              onChange={(v) => setForm({ ...form, totalFileLimit: v })}
            />
            <Field
              label="Files per folder"
              value={form.filesPerFolder}
              onChange={(v) => setForm({ ...form, filesPerFolder: v })}
            />
          </div>

          <div className="rounded-3xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Allowed file types</div>
                <div className="mt-1 text-xs text-gray-600">
                  Users can upload only these types under this package.
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {["IMAGE", "VIDEO", "PDF", "AUDIO"].map((t) => {
                const selected = form.allowedTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleAllowed(t)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-[0.98] ${
                      selected
                        ? "bg-gray-900 text-white shadow-sm"
                        : "border bg-white text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <button
              className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
              onClick={submit}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <input
        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
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