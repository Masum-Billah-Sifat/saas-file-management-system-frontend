"use client";

import { api } from "./api";

export type Package = {
  id: string;
  name: string;
  maxFolders: number;
  maxNestingLevel: number;
  allowedTypes: string[];
  maxFileSizeMB: number;
  totalFileLimit: number;
  filesPerFolder: number;
  isSystem: boolean;
  isActive: boolean;
};

export type SubscriptionRow = {
  id: string;
  startAt: string;
  endAt: string | null;
  pkg: Package;
};

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
};

export type FileItem = {
  id: string;
  name: string;
  kind: string;
  sizeBytes: number;
  publicUrl?: string | null;
  mimeType?: string | null;
  folderId: string;
  createdAt: string;
};

export const endpoints = {
  // Packages
  publicPackages: () => api.get("/public/packages"),
  userPackages: () => api.get("/packages"),
  adminPackages: () => api.get("/admin/packages"),
  adminCreatePackage: (payload: any) => api.post("/admin/packages", payload),
  adminUpdatePackage: (id: string, payload: any) => api.put(`/admin/packages/${id}`, payload),
  adminDeactivatePackage: (id: string) => api.delete(`/admin/packages/${id}`),

  // Subscription
  subscriptionHistory: () => api.get("/subscriptions/history"),
  activateSubscription: (packageId: string) => api.post("/subscriptions/activate", { packageId }),

  // Folders
  listFolders: () => api.get("/folders"),
  createFolder: (name: string, parentId?: string) => api.post("/folders", { name, parentId }),
  renameFolder: (id: string, name: string) => api.put(`/folders/${id}`, { name }),
  deleteFolder: (id: string) => api.delete(`/folders/${id}`),

  // Files
  listFilesInFolder: (folderId: string) => api.get(`/folders/${folderId}/files`),
  uploadFile: (folderId: string, file: File) => {
    const fd = new FormData();
    fd.append("folderId", folderId);
    fd.append("file", file);
    return api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  // downloadFile: (fileId: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${fileId}/download`,
  // downloadFile: (fileId: string) => api.get(`/files/${fileId}/download`),
  downloadFile: (fileId: string) => api.get(`/files/${fileId}/download`),
  renameFile: (id: string, name: string) => api.put(`/files/${id}`, { name }),
  deleteFile: (id: string) => api.delete(`/files/${id}`),
};