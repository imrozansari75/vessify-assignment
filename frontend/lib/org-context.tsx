"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface Org {
  id: string;
  name: string;
}

interface OrgContextType {
  orgs: Org[];
  selectedOrg: Org | null;
  setOrgs: (orgs: Org[]) => void;
  selectOrg: (org: Org) => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

  const selectOrg = useCallback((org: Org) => {
    setSelectedOrg(org);
    if (typeof window !== "undefined") {
      localStorage.setItem("organizationId", org.id);
    }
  }, []);

  return (
    <OrgContext.Provider value={{ orgs, selectedOrg, setOrgs, selectOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
