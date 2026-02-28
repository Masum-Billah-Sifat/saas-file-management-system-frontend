"use client";

import { Toaster } from "react-hot-toast";
import AuthBootstrap from "@/components/AuthBootstrap";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthBootstrap />
      {children}
      <Toaster position="top-right" />
    </>
  );
}