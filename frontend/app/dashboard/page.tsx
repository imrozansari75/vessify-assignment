"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { OrgSelector } from "@/components/org-selector";
import { TransactionExtractor } from "@/components/transaction-extractor";
import { TransactionTable } from "@/components/transaction-table";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance?: number;
  confidence: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { selectedOrg, setOrgs, selectOrg } = useOrg();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api
      .getOrganizations()
      .then((orgs) => {
        setOrgs(orgs);
        const saved =
          typeof window !== "undefined"
            ? localStorage.getItem("organizationId")
            : null;
        const target = saved
          ? orgs.find((o: { id: string }) => o.id === saved)
          : orgs[0];
        if (target) selectOrg(target);
      })
      .catch(() => setError("Failed to load organizations"));
  }, [user, setOrgs, selectOrg]);

  useEffect(() => {
    if (!selectedOrg) return;

    let cancelled = false;
    const organizationId = selectedOrg.id;

    async function loadTransactions() {
      setTxLoading(true);
      setError("");
      try {
        const data = await api.getTransactions(organizationId);
        if (!cancelled) setTransactions(data);
      } catch {
        if (!cancelled) setError("Failed to load transactions");
      } finally {
        if (!cancelled) setTxLoading(false);
      }
    }

    void loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [selectedOrg]);

  const handleExtract = useCallback(
    async (text: string) => {
      if (!selectedOrg) return;
      const tx = await api.extractTransaction(selectedOrg.id, text);
      setTransactions((prev) => [tx, ...prev]);
    },
    [selectedOrg]
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const stats = {
    count: transactions.length,
    total: transactions.reduce(
      (sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0),
      0
    ),
    confidence: transactions.length
      ? Math.round(
          transactions.reduce((sum, t) => sum + t.confidence, 0) /
            transactions.length
        )
      : 0,
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome {user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <OrgSelector onError={setError} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.count}</p>
          <p className="text-sm text-gray-500 mt-1">Transactions</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">
            {"\u20B9"}
            {stats.total.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Spend</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.confidence}%</p>
          <p className="text-sm text-gray-500 mt-1">Confidence Score</p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {selectedOrg ? (
        <TransactionExtractor onExtract={handleExtract} />
      ) : (
        <div className="border rounded-lg p-4 text-sm text-gray-500">
          Create an organization to start extracting transactions.
        </div>
      )}

      <TransactionTable
        transactions={transactions}
        loading={txLoading}
      />
    </div>
  );
}
