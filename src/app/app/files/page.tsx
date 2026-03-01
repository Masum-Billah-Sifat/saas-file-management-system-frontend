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

export default function FilesPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);

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

  // -------- load data ----------
  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await endpoints.listFolders();
      const list: Folder[] = res.data.data || [];
      setFolders(list);

      // auto select first folder if none selected
      if (!selectedFolderId && list.length > 0) setSelectedFolderId(list[0].id);
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
      // 403 is enforcement; do not logout.
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
      const res = await endpoints.downloadFile(fileId); // axios GET
      const url = res.data.data.url as string;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      console.log("DOWNLOAD_ERROR", e?.response?.status, e?.response?.data);
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

  const renderSection = (title: string, list: FileItem[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mt-5">
        <div className="mb-2 text-sm font-semibold text-gray-700">{title}</div>
        <div className="divide-y rounded-2xl border">
          {list.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gray-500">
                  {f.kind} • {bytesToMB(f.sizeBytes)} MB
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() => openPreview(f)}
                >
                  Preview
                </button>

                <button
                  className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() => downloadByApi(f.id)}
                >
                  Download
                </button>

                <button
                  className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() => openRenameFile(f)}
                >
                  Rename
                </button>

                <button
                  className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() => archiveFile(f.id)}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -------- UI ----------
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Folders</h2>
          <button
            className="rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90"
            onClick={() => setCreateOpen(true)}
          >
            + New
          </button>
        </div>

        <div className="mt-3 space-y-1">
          {loadingFolders && (
            <div className="text-sm text-gray-500">Loading…</div>
          )}

          {!loadingFolders && folders.length === 0 && (
            <div className="text-sm text-gray-500">
              No folders yet. Create one.
            </div>
          )}

          {folders.map((f) => (
            <div
              key={f.id}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm ${
                selectedFolderId === f.id
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              <button
                className="flex-1 text-left"
                onClick={() => setSelectedFolderId(f.id)}
              >
                <span style={{ marginLeft: (f.depth - 1) * 10 }}>{f.name}</span>
              </button>

              <div className="flex gap-1">
                <button
                  className={`rounded-lg px-2 py-1 ${
                    selectedFolderId === f.id
                      ? "hover:bg-white/20"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => openRenameFolder(f)}
                >
                  Rename
                </button>

                <button
                  className={`rounded-lg px-2 py-1 ${
                    selectedFolderId === f.id
                      ? "hover:bg-white/20"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => archiveFolder(f.id)}
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Files</h1>
            <p className="text-sm text-gray-600">
              {selectedFolder
                ? `Selected: ${selectedFolder.name}`
                : "Select a folder to view files"}
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-4 py-2 text-white hover:opacity-90">
            <input
              type="file"
              className="hidden"
              onChange={(e) => uploadFile(e.target.files?.[0] || null)}
            />
            Upload
          </label>
        </div>

        <div className="mt-4">
          {loadingFiles && (
            <div className="text-sm text-gray-500">Loading files…</div>
          )}

          {!loadingFiles && files.length === 0 && (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              No files in this folder yet.
            </div>
          )}

          {!loadingFiles && files.length > 0 && (
            <>
              {renderSection("Images", grouped.IMAGE)}
              {renderSection("Videos", grouped.VIDEO)}
              {renderSection("PDFs", grouped.PDF)}
              {renderSection("Audios", grouped.AUDIO)}
            </>
          )}
        </div>
      </div>

      {/* Create folder modal */}
      <Modal
        open={createOpen}
        title="Create folder"
        onClose={() => setCreateOpen(false)}
      >
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border px-4 py-2"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />

          <select
            className="w-full rounded-xl border px-4 py-2"
            value={newParentId || ""}
            onChange={(e) => setNewParentId(e.target.value || undefined)}
          >
            <option value="">(Root folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {"-".repeat(Math.max(0, f.depth - 1))} {f.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
              onClick={createFolder}
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename folder modal */}
      <Modal
        open={renameFolderOpen}
        title="Rename folder"
        onClose={() => setRenameFolderOpen(false)}
      >
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border px-4 py-2"
            value={renameFolderName}
            onChange={(e) => setRenameFolderName(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
              onClick={() => setRenameFolderOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
              onClick={renameFolder}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename file modal */}
      <Modal
        open={renameFileOpen}
        title="Rename file"
        onClose={() => setRenameFileOpen(false)}
      >
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border px-4 py-2"
            value={renameFileName}
            onChange={(e) => setRenameFileName(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
              onClick={() => setRenameFileOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
              onClick={renameFile}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal
        open={previewOpen}
        title={`Preview: ${previewFile?.name || ""}`}
        onClose={closePreview}
      >
        {previewLoading && (
          <div className="text-sm text-gray-600">Loading preview…</div>
        )}

        {!previewLoading && !previewUrl && (
          <div className="text-sm text-gray-600">No preview available.</div>
        )}

        {!previewLoading && previewUrl && previewFile && (
          <div className="w-full">
            {previewFile.kind === "IMAGE" && (
              <img
                src={previewUrl}
                alt={previewFile.name}
                className="max-h-[70vh] w-full rounded-xl border object-contain"
              />
            )}

            {previewFile.kind === "VIDEO" && (
              <video
                src={previewUrl}
                controls
                className="max-h-[70vh] w-full rounded-xl border"
              />
            )}

            {previewFile.kind === "AUDIO" && (
              <audio src={previewUrl} controls className="w-full" />
            )}

            {previewFile.kind === "PDF" && (
              <iframe
                src={previewUrl}
                className="h-[70vh] w-full rounded-xl border"
              />
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            onClick={closePreview}
          >
            Close
          </button>
          {previewUrl && (
            <a
              className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
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
  );
}
