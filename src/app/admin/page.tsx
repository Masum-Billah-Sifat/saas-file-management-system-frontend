"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => { load(); }, []);

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
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin: Packages</h1>
          <button className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90" onClick={openCreate}>
            + Create
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Manage subscription packages and limits. Free package is system-protected.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {loading && <div className="text-sm text-gray-500">Loading…</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.name}</div>
                <div className="flex gap-2">
                  <span className={`text-xs rounded-full px-2 py-1 ${p.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                  {p.isSystem && <span className="text-xs rounded-full bg-black text-white px-2 py-1">System</span>}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>Max folders: {p.maxFolders}</div>
                <div>Nesting: {p.maxNestingLevel}</div>
                <div>Max size: {p.maxFileSizeMB} MB</div>
                <div>Total files: {p.totalFileLimit}</div>
                <div>Files/folder: {p.filesPerFolder}</div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Allowed: {p.allowedTypes.join(", ")}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => openEdit(p)}>
                  Edit
                </button>
                <button
                  className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => deactivate(p)}
                  disabled={p.isSystem || !p.isActive}
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={open} title={editing ? "Edit package" : "Create package"} onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          <input className="w-full rounded-xl border px-4 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div className="grid grid-cols-2 gap-3">
            <input className="w-full rounded-xl border px-4 py-2" type="number" placeholder="Max folders" value={form.maxFolders} onChange={(e) => setForm({ ...form, maxFolders: Number(e.target.value) })} />
            <input className="w-full rounded-xl border px-4 py-2" type="number" placeholder="Max nesting" value={form.maxNestingLevel} onChange={(e) => setForm({ ...form, maxNestingLevel: Number(e.target.value) })} />
            <input className="w-full rounded-xl border px-4 py-2" type="number" placeholder="Max file size (MB)" value={form.maxFileSizeMB} onChange={(e) => setForm({ ...form, maxFileSizeMB: Number(e.target.value) })} />
            <input className="w-full rounded-xl border px-4 py-2" type="number" placeholder="Total file limit" value={form.totalFileLimit} onChange={(e) => setForm({ ...form, totalFileLimit: Number(e.target.value) })} />
            <input className="w-full rounded-xl border px-4 py-2" type="number" placeholder="Files per folder" value={form.filesPerFolder} onChange={(e) => setForm({ ...form, filesPerFolder: Number(e.target.value) })} />
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium">Allowed Types</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["IMAGE", "VIDEO", "PDF", "AUDIO"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleAllowed(t)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    form.allowedTypes.includes(t) ? "bg-black text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button className="rounded-xl border px-4 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90" onClick={submit}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}