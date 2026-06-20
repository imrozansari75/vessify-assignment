const BASE = "";

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  signIn: (email: string, password: string) =>
    request("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signUp: (name: string, email: string, password: string) =>
    request("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  signOut: () =>
    request("/api/auth/sign-out", { method: "POST" }),

  getSession: () => request("/api/auth/session"),

  getOrganizations: () => request("/api/organizations"),

  createOrganization: (name: string) =>
    request("/api/organizations", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getTransactions: (orgId: string) =>
    request("/api/transactions", {
      headers: { "x-organization-id": orgId },
    }),

  extractTransaction: (orgId: string, text: string) =>
    request("/api/transactions/extract", {
      method: "POST",
      headers: { "x-organization-id": orgId },
      body: JSON.stringify({ text }),
    }),

  createTransaction: (
    orgId: string,
    data: { date: string; description: string; amount: number; balance?: number; confidence?: number }
  ) =>
    request("/api/transactions", {
      method: "POST",
      headers: { "x-organization-id": orgId },
      body: JSON.stringify(data),
    }),
};
