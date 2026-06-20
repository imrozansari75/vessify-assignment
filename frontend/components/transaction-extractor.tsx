"use client";

import { useState } from "react";

interface Props {
  onExtract: (text: string) => Promise<void>;
}

export function TransactionExtractor({ onExtract }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await onExtract(text.trim());
      setText("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Unable to extract transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h2 className="font-semibold">Paste Statement</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste bank statement text here...

Example:
Date: 11 Dec 2025
Description: Starbucks Coffee
Amount: -420`}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm font-medium">
            Transaction Added
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-black text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Extracting..." : "Extract"}
        </button>
      </form>
    </div>
  );
}
