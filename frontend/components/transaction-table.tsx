"use client";

import { useState, useMemo } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance?: number;
  confidence: number;
}

interface Props {
  transactions: Transaction[];
  loading: boolean;
}

type SortField = "date" | "description" | "amount" | "confidence";
type DatePreset = "all" | "7d" | "30d" | "90d" | "year";

export function TransactionTable({ transactions, loading }: Props) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DatePreset>("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let items = transactions;

    if (search) {
      const q = search.toLowerCase();
      items = items.filter((t) => t.description.toLowerCase().includes(q));
    }

    if (dateRange !== "all") {
      const now = new Date();
      let cutoff: Date;
      if (dateRange === "7d") {
        cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 7);
      } else if (dateRange === "30d") {
        cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 30);
      } else if (dateRange === "90d") {
        cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 90);
      } else {
        cutoff = new Date(now.getFullYear(), 0, 1);
      }
      items = items.filter((t) => new Date(t.date) >= cutoff);
    }

    if (minAmount) {
      const min = Number(minAmount);
      if (!isNaN(min)) {
        items = items.filter((t) => Math.abs(t.amount) >= min);
      }
    }
    if (maxAmount) {
      const max = Number(maxAmount);
      if (!isNaN(max)) {
        items = items.filter((t) => Math.abs(t.amount) <= max);
      }
    }

    items = [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "description") {
        cmp = a.description.localeCompare(b.description);
      } else if (sortField === "amount") {
        cmp = a.amount - b.amount;
      } else if (sortField === "confidence") {
        cmp = a.confidence - b.confidence;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return items;
  }, [transactions, search, dateRange, minAmount, maxAmount, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";

  const fmtDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  const fmtAmount = (n: number) =>
    "\u20B9" + Math.abs(n).toLocaleString("en-IN");

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Transactions</h2>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search transactions..."
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value as DatePreset);
            setPage(0);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Min</span>
          <input
            type="number"
            value={minAmount}
            onChange={(e) => {
              setMinAmount(e.target.value);
              setPage(0);
            }}
            placeholder="0"
            className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <span className="text-xs text-gray-500">Max</span>
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => {
              setMaxAmount(e.target.value);
              setPage(0);
            }}
            placeholder="99999"
            className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th
                className="text-left px-4 py-2.5 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => toggleSort("date")}
              >
                Date{sortIndicator("date")}
              </th>
              <th
                className="text-left px-4 py-2.5 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => toggleSort("description")}
              >
                Description{sortIndicator("description")}
              </th>
              <th
                className="text-right px-4 py-2.5 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => toggleSort("amount")}
              >
                Amount{sortIndicator("amount")}
              </th>
              <th
                className="text-right px-4 py-2.5 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => toggleSort("confidence")}
              >
                Confidence{sortIndicator("confidence")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center px-4 py-8 text-gray-500"
                >
                  {search || dateRange !== "all" || minAmount || maxAmount
                    ? "No matching transactions"
                    : "No transactions yet. Paste a bank statement above to get started."}
                </td>
              </tr>
            ) : (
              paged.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-2.5">{fmtDate(tx.date)}</td>
                  <td className="px-4 py-2.5">{tx.description}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-medium ${
                      tx.amount < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {tx.amount < 0 ? "-" : "+"}
                    {fmtAmount(tx.amount)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {Math.round(tx.confidence)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Showing {page * pageSize + 1}-
            {Math.min((page + 1) * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded-lg transition-colors ${
                  page === i
                    ? "bg-black text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
