"use client";

import { useState } from "react";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";

interface Props {
  onError?: (message: string) => void;
}

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Failed to create organization";
}

export function OrgSelector({ onError }: Props) {
  const { orgs, selectedOrg, setOrgs, selectOrg } = useOrg();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    onError?.("");
    try {
      const org = await api.createOrganization(trimmed);
      setOrgs([...orgs, org]);
      selectOrg(org);
      setName("");
    } catch (err: unknown) {
      onError?.(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Organization
        </label>
        <select
          value={selectedOrg?.id || ""}
          onChange={(e) => {
            const org = orgs.find((o) => o.id === e.target.value);
            if (org) selectOrg(org);
          }}
          disabled={orgs.length === 0}
          className="min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
        >
          {orgs.length === 0 ? (
            <option value="">No organizations</option>
          ) : (
            orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))
          )}
        </select>
      </div>

      <form onSubmit={handleCreate} className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            New organization
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company A"
            className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {creating ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
