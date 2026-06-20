"use client";

import { AuthProvider } from "@/lib/auth-context";
import { OrgProvider } from "@/lib/org-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrgProvider>{children}</OrgProvider>
    </AuthProvider>
  );
}
