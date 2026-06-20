"use client";

import { useOrg } from "@/lib/org-context";

export function OrgSelector() {
  const { orgs, selectedOrg, selectOrg } = useOrg();

  if (orgs.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No organizations found. Create one to get started.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        Organization:
      </label>
      <select
        value={selectedOrg?.id || ""}
        onChange={(e) => {
          const org = orgs.find((o) => o.id === e.target.value);
          if (org) selectOrg(org);
        }}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      >
        {orgs.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
