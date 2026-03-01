"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { endpoints, Folder, FileItem } from "@/lib/endpoints";

function bytesToMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function titleForKind(kind: string) {
  switch (kind) {
    case "IMAGE":
      return "Images";
    case "VIDEO":
      return "Videos";
    case "PDF":
      return "PDFs";
    case "AUDIO":
      return "Audios";
    default:
      return "Other";
  }
}

function kindDotClass(kind: string) {
  switch (kind) {
    case "IMAGE":
      return "bg-emerald-500";
    case "VIDEO":
      return "bg-indigo-500";
    case "PDF":
      return "bg-rose-500";
    case "AUDIO":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
}

type FolderNode = Folder & { children: FolderNode[] };

function buildTree(folders: Folder[]): FolderNode[] {
  if (!folders || folders.length === 0) return [];

  // If API provides parentId, use it.
  const hasParentId = folders.some((f: any) => "parentId" in f && (f as any).parentId !== undefined);

  if (hasParentId) {
    const map = new Map<string, FolderNode>();
    for (const f of folders) map.set(f.id, { ...(f as any), children: [] });

    const roots: FolderNode[] = [];
    for (const f of folders as any[]) {
      const node = map.get(f.id)!;
      const pid = f.parentId;
      if (!pid) {
        roots.push(node);
      } else {
        const parent = map.get(pid);
        if (parent) parent.children.push(node);
        else roots.push(node);
      }
    }

    // Stable sort (optional, keeps it neat)
    const sortRec = (arr: FolderNode[]) => {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      for (const n of arr) sortRec(n.children);
    };
    sortRec(roots);

    return roots;
  }

  // Fallback: build tree using depth + list order (assumes list is hierarchical order)
  const nodes = folders.map((f) => ({ ...(f as any), children: [] as FolderNode[] })) as FolderNode[];
  const roots: FolderNode[] = [];
  const stack: FolderNode[] = [];

  for (const node of nodes) {
    const d = Math.max(1, Number((node as any).depth || 1));

    while (stack.length >= d) stack.pop();

    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].children.push(node);

    stack.push(node);
  }

  return roots;
}

export default function FilesPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // UI-only state
  const [folderSearch, setFolderSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [mobileFoldersOpen, setMobileFoldersOpen] = useState(false);

  // Expand/collapse state for tree
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Folder create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newParentId, setNewParentId] = useState<string | undefined>(undefined);

  // Rename folder modal
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  // Rename file modal
  const [renameFileOpen, setRenameFileOpen] = useState(false);
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameFileName, setRenameFileName] = useState("");

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const selectedFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) || null,
    [folders, selectedFolderId],
  );

  const treeRoots = useMemo(() => buildTree(folders), [folders]);

  const grouped = useMemo(() => {
    const g = {
      IMAGE: [] as FileItem[],
      VIDEO: [] as FileItem[],
      PDF: [] as FileItem[],
      AUDIO: [] as FileItem[],
    };
    for (const f of files) {
      const kind = (f.kind || "PDF") as keyof typeof g;
      if (g[kind]) g[kind].push(f);
    }
    return g;
  }, [files]);

  const filteredFiles = useMemo(() => {
    const q = fileSearch.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => (f.name || "").toLowerCase().includes(q));
  }, [files, fileSearch]);

  const groupedFiltered = useMemo(() => {
    const g = {
      IMAGE: [] as FileItem[],
      VIDEO: [] as FileItem[],
      PDF: [] as FileItem[],
      AUDIO: [] as FileItem[],
    };
    for (const f of filteredFiles) {
      const kind = (f.kind || "PDF") as keyof typeof g;
      if (g[kind]) g[kind].push(f);
    }
    return g;
  }, [filteredFiles]);

  // -------- load data ----------
  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await endpoints.listFolders();
      const list: Folder[] = res.data.data || [];
      setFolders(list);

      // auto select first folder if none selected
      if (!selectedFolderId && list.length > 0) setSelectedFolderId(list[0].id);

      // expand roots by default (nice UX)
      setExpanded((prev) => {
        const next = { ...prev };
        for (const f of list) {
          const d = Math.max(1, Number((f as any).depth || 1));
          if (d === 1 && next[f.id] === undefined) next[f.id] = true;
        }
        return next;
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load folders");
    } finally {
      setLoadingFolders(false);
    }
  };

  const loadFiles = async (folderId: string) => {
    setLoadingFiles(true);
    try {
      const res = await endpoints.listFilesInFolder(folderId);
      setFiles(res.data.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedFolderId) loadFiles(selectedFolderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderId]);

  // -------- folder actions ----------
  const createFolder = async () => {
    if (!newFolderName.trim()) return toast.error("Folder name required");

    try {
      await endpoints.createFolder(newFolderName.trim(), newParentId);
      toast.success("Folder created");
      setCreateOpen(false);
      setNewFolderName("");
      setNewParentId(undefined);
      await loadFolders();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create folder");
    }
  };

  const openRenameFolder = (f: Folder) => {
    setRenameFolderId(f.id);
    setRenameFolderName(f.name);
    setRenameFolderOpen(true);
  };

  const renameFolder = async () => {
    if (!renameFolderId) return;
    if (!renameFolderName.trim()) return toast.error("Name required");

    try {
      await endpoints.renameFolder(renameFolderId, renameFolderName.trim());
      toast.success("Folder renamed");
      setRenameFolderOpen(false);
      await loadFolders();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to rename folder");
    }
  };

  const archiveFolder = async (id: string) => {
    if (!confirm("Archive this folder and its subtree?")) return;

    try {
      await endpoints.deleteFolder(id);
      toast.success("Folder archived");
      setSelectedFolderId(null);
      setFiles([]);
      await loadFolders();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to archive folder");
    }
  };

  // -------- file actions ----------
  const uploadFile = async (file: File | null) => {
    if (!selectedFolderId) return toast.error("Select a folder first");
    if (!file) return;

    try {
      await endpoints.uploadFile(selectedFolderId, file);
      toast.success("Uploaded");
      await loadFiles(selectedFolderId);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Upload failed");
    }
  };

  const openRenameFile = (f: FileItem) => {
    setRenameFileId(f.id);
    setRenameFileName(f.name);
    setRenameFileOpen(true);
  };

  const renameFile = async () => {
    if (!renameFileId) return;
    if (!renameFileName.trim()) return toast.error("Name required");

    try {
      await endpoints.renameFile(renameFileId, renameFileName.trim());
      toast.success("File renamed");
      setRenameFileOpen(false);
      if (selectedFolderId) await loadFiles(selectedFolderId);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Rename failed");
    }
  };

  const archiveFile = async (id: string) => {
    if (!confirm("Archive this file?")) return;

    try {
      await endpoints.deleteFile(id);
      toast.success("File archived");
      if (selectedFolderId) await loadFiles(selectedFolderId);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const downloadByApi = async (fileId: string) => {
    try {
      const res = await endpoints.downloadFile(fileId);
      const url = res.data.data.url as string;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Download failed");
    }
  };

  // -------- preview ----------
  const openPreview = async (file: FileItem) => {
    setPreviewFile(file);
    setPreviewOpen(true);

    if (file.publicUrl) {
      setPreviewUrl(file.publicUrl);
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await endpoints.downloadFile(file.id);
      setPreviewUrl(res.data.data.url);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Preview failed");
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
    setPreviewUrl(null);
    setPreviewLoading(false);
  };

  // ---------- Tree UI ----------
  const toggleExpand = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    const walk = (nodes: FolderNode[]) => {
      for (const n of nodes) {
        if (n.children.length > 0) next[n.id] = true;
        walk(n.children);
      }
    };
    walk(treeRoots);
    setExpanded((p) => ({ ...p, ...next }));
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const matchesSearch = (name: string) =>
    name.toLowerCase().includes(folderSearch.trim().toLowerCase());

  const filterTree = (nodes: FolderNode[]): FolderNode[] => {
    const q = folderSearch.trim().toLowerCase();
    if (!q) return nodes;

    const recur = (arr: FolderNode[]): FolderNode[] => {
      const out: FolderNode[] = [];
      for (const n of arr) {
        const kids = recur(n.children);
        const selfMatch = matchesSearch(n.name || "");
        if (selfMatch || kids.length > 0) {
          out.push({ ...n, children: kids });
        }
      }
      return out;
    };

    return recur(nodes);
  };

  const visibleTree = useMemo(() => filterTree(treeRoots), [treeRoots, folderSearch]);

  const TreeNodeView = ({
    node,
    level,
    onPick,
  }: {
    node: FolderNode;
    level: number;
    onPick?: () => void;
  }) => {
    const isActive = selectedFolderId === node.id;
    const isExpanded = !!expanded[node.id];
    const hasKids = node.children && node.children.length > 0;

    return (
      <div>
        <div
          className={`group flex items-center justify-between gap-2 rounded-2xl px-2 py-1.5 transition ${
            isActive ? "bg-gray-900 text-white" : "hover:bg-gray-50"
          }`}
          style={{ paddingLeft: 8 + level * 14 }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-xl transition active:scale-[0.98] ${
                isActive ? "hover:bg-white/15" : "hover:bg-gray-100"
              } ${hasKids ? "" : "opacity-40 cursor-default"}`}
              onClick={() => hasKids && toggleExpand(node.id)}
              aria-label={hasKids ? (isExpanded ? "Collapse folder" : "Expand folder") : "No children"}
            >
              {hasKids ? (
                <span className={`text-sm leading-none transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                  ›
                </span>
              ) : (
                <span className="text-xs">•</span>
              )}
            </button>

            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                setSelectedFolderId(node.id);
                // auto-expand when selecting (nice Drive behavior)
                if (hasKids) setExpanded((p) => ({ ...p, [node.id]: true }));
                onPick?.();
              }}
              title={node.name}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-xl ${
                    isActive ? "bg-white/15" : "bg-gray-100"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-white" : "bg-gray-900"}`} />
                </span>
                <span className="truncate text-sm font-semibold">{node.name}</span>
              </div>
            </button>
          </div>

          <div className="hidden items-center gap-1 sm:flex">
            <button
              className={`rounded-xl px-2 py-1 text-xs font-semibold transition active:scale-[0.98] ${
                isActive ? "hover:bg-white/15" : "hover:bg-gray-100"
              }`}
              onClick={() => openRenameFolder(node)}
            >
              Rename
            </button>
            <button
              className={`rounded-xl px-2 py-1 text-xs font-semibold transition active:scale-[0.98] ${
                isActive ? "hover:bg-white/15" : "hover:bg-gray-100"
              }`}
              onClick={() => archiveFolder(node.id)}
            >
              Delete
            </button>
          </div>
        </div>

        {hasKids && isExpanded && (
          <div className="animate-pop">
            {node.children.map((c) => (
              <TreeNodeView key={c.id} node={c} level={level + 1} onPick={onPick} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const FolderTree = ({ onPick }: { onPick?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold tracking-tight">Folders</p>
          <p className="text-xs text-gray-500">Click to expand like Drive</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
          onClick={() => setCreateOpen(true)}
        >
          + New
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        <input
          className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
          placeholder="Search folders…"
          value={folderSearch}
          onChange={(e) => setFolderSearch(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <button
            className="rounded-2xl border bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
            onClick={expandAll}
            disabled={loadingFolders || folders.length === 0}
          >
            Expand all
          </button>
          <button
            className="rounded-2xl border bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
            onClick={collapseAll}
            disabled={loadingFolders || folders.length === 0}
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-auto pr-1">
        {loadingFolders && (
          <div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-600">
            Loading folders…
          </div>
        )}

        {!loadingFolders && folders.length === 0 && (
          <div className="rounded-2xl border bg-gray-50 p-5">
            <p className="text-sm font-semibold text-gray-900">No folders yet</p>
            <p className="mt-1 text-sm text-gray-700">Create a folder to start organizing your files.</p>
            <button
              className="mt-4 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
              onClick={() => setCreateOpen(true)}
            >
              + Create folder
            </button>
          </div>
        )}

        {!loadingFolders && folders.length > 0 && (
          <div className="space-y-1">
            {/* Root node */}
            <div className="rounded-2xl border bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-600">Root</div>
                <div className="text-xs text-gray-500">{folders.length} folders</div>
              </div>
            </div>

            <div className="mt-2">
              {visibleTree.map((n) => (
                <TreeNodeView key={n.id} node={n} level={0} onPick={onPick} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border bg-gray-50 p-3 text-xs text-gray-600">
        Tip: Nesting depth is enforced by your active package.
      </div>
    </div>
  );

  const FileSection = ({ kind, list }: { kind: string; list: FileItem[] }) => {
    if (list.length === 0) return null;

    return (
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${kindDotClass(kind)}`} />
            <p className="text-sm font-semibold text-gray-900">{titleForKind(kind)}</p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
              {list.length}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-white">
          <div className="hidden grid-cols-[1fr_140px_240px] gap-3 border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 sm:grid">
            <div>Name</div>
            <div>Size</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y">
            {list.map((f) => (
              <div
                key={f.id}
                className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[1fr_140px_240px] sm:items-center sm:gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${kindDotClass(f.kind)}`} />
                    <p className="truncate text-sm font-semibold text-gray-900">{f.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {f.kind} • {bytesToMB(f.sizeBytes)} MB
                  </p>
                </div>

                <div className="text-sm font-semibold text-gray-900 sm:text-gray-700">
                  {bytesToMB(f.sizeBytes)} MB
                </div>

                <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                  <button
                    className="rounded-2xl border bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                    onClick={() => openPreview(f)}
                  >
                    Preview
                  </button>

                  <button
                    className="rounded-2xl border bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                    onClick={() => downloadByApi(f.id)}
                  >
                    Download
                  </button>

                  <button
                    className="rounded-2xl border bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                    onClick={() => openRenameFile(f)}
                  >
                    Rename
                  </button>

                  <button
                    className="rounded-2xl border bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                    onClick={() => archiveFile(f.id)}
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // -------- UI ----------
  return (
    <div className="mx-auto max-w-6xl px-2 sm:px-0">
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden h-[calc(100vh-140px)] rounded-3xl border bg-white p-4 shadow-sm lg:block">
          <FolderTree />
        </aside>

        {/* Mobile folder button + slide-over */}
        <div className="lg:hidden">
          <div className="rounded-3xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold tracking-tight">Files</p>
                <p className="truncate text-sm text-gray-600">
                  {selectedFolder ? `Selected: ${selectedFolder.name}` : "Select a folder to view files"}
                </p>
              </div>

              <button
                className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                onClick={() => setMobileFoldersOpen(true)}
              >
                Folders
              </button>
            </div>
          </div>

          <div className={`fixed inset-0 z-50 transition ${mobileFoldersOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <div
              className={`absolute inset-0 bg-black/30 transition-opacity ${mobileFoldersOpen ? "opacity-100" : "opacity-0"}`}
              onClick={() => setMobileFoldersOpen(false)}
            />
            <div
              className={`absolute left-0 top-0 h-full w-[92%] max-w-sm transform rounded-r-3xl border-r bg-white p-4 shadow-xl transition-transform ${
                mobileFoldersOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-lg font-semibold">Folders</p>
                <button
                  className="rounded-2xl border bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                  onClick={() => setMobileFoldersOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="h-[calc(100vh-90px)]">
                <FolderTree onPick={() => setMobileFoldersOpen(false)} />
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold tracking-tight">Files</h1>
              <p className="truncate text-sm text-gray-600">
                {selectedFolder ? `Folder: ${selectedFolder.name}` : "Select a folder from the tree"}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                onClick={() => selectedFolderId && loadFiles(selectedFolderId)}
                disabled={!selectedFolderId}
              >
                Refresh
              </button>

              <label className="group inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]">
                <input type="file" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0] || null)} />
                Upload
                <span className="ml-2 inline-block transition group-hover:translate-x-0.5">→</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <input
              className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
              placeholder="Search files in this folder…"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              disabled={!selectedFolderId}
            />
          </div>

          <div className="mt-5">
            {!selectedFolderId && (
              <div className="rounded-3xl border bg-gray-50 p-6">
                <p className="text-sm font-semibold text-gray-900">Pick a folder from the left tree</p>
                <p className="mt-1 text-sm text-gray-700">Click the arrow to expand folders like Google Drive.</p>
              </div>
            )}

            {selectedFolderId && loadingFiles && (
              <div className="rounded-3xl border bg-gray-50 p-5 text-sm text-gray-700">Loading files…</div>
            )}

            {selectedFolderId && !loadingFiles && filteredFiles.length === 0 && (
              <div className="rounded-3xl border bg-gray-50 p-6">
                <p className="text-sm font-semibold text-gray-900">No files found</p>
                <p className="mt-1 text-sm text-gray-700">
                  {files.length === 0 ? "This folder is empty. Upload a file to get started." : "No files match your search."}
                </p>
              </div>
            )}

            {selectedFolderId && !loadingFiles && filteredFiles.length > 0 && (
              <>
                <FileSection kind="IMAGE" list={groupedFiltered.IMAGE} />
                <FileSection kind="VIDEO" list={groupedFiltered.VIDEO} />
                <FileSection kind="PDF" list={groupedFiltered.PDF} />
                <FileSection kind="AUDIO" list={groupedFiltered.AUDIO} />
              </>
            )}
          </div>
        </section>

        {/* Create folder modal */}
        <Modal open={createOpen} title="Create folder" onClose={() => setCreateOpen(false)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Folder name</label>
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                placeholder="e.g., Projects"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Parent folder</label>
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                value={newParentId || ""}
                onChange={(e) => setNewParentId(e.target.value || undefined)}
              >
                <option value="">(Root folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {"-".repeat(Math.max(0, Number((f as any).depth || 1) - 1))} {f.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Nesting depth is enforced by the active package.</p>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
                onClick={createFolder}
              >
                Create
              </button>
            </div>
          </div>
        </Modal>

        {/* Rename folder modal */}
        <Modal open={renameFolderOpen} title="Rename folder" onClose={() => setRenameFolderOpen(false)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">New name</label>
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                onClick={() => setRenameFolderOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
                onClick={renameFolder}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>

        {/* Rename file modal */}
        <Modal open={renameFileOpen} title="Rename file" onClose={() => setRenameFileOpen(false)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">New name</label>
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                value={renameFileName}
                onChange={(e) => setRenameFileName(e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                onClick={() => setRenameFileOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
                onClick={renameFile}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>

        {/* Preview modal */}
        <Modal open={previewOpen} title={`Preview: ${previewFile?.name || ""}`} onClose={closePreview}>
          {previewLoading && <div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700">Loading preview…</div>}
          {!previewLoading && !previewUrl && <div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700">No preview available.</div>}

          {!previewLoading && previewUrl && previewFile && (
            <div className="w-full">
              {previewFile.kind === "IMAGE" && (
                <img src={previewUrl} alt={previewFile.name} className="max-h-[70vh] w-full rounded-2xl border object-contain" />
              )}
              {previewFile.kind === "VIDEO" && <video src={previewUrl} controls className="max-h-[70vh] w-full rounded-2xl border" />}
              {previewFile.kind === "AUDIO" && <audio src={previewUrl} controls className="w-full" />}
              {previewFile.kind === "PDF" && <iframe src={previewUrl} className="h-[70vh] w-full rounded-2xl border" />}
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <button
              className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              onClick={closePreview}
            >
              Close
            </button>
            {previewUrl && (
              <a
                className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in new tab
              </a>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}