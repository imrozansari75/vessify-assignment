import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { requireOrg } from "../lib/org";
import { parseTransaction } from "../utils/parser";

const app = new Hono();

app.post("/extract", async (c) => {
  try {
    const { user, organizationId } = await requireOrg(c);
    const { text } = await c.req.json();

    if (!text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const parsed = parseTransaction(text);

    const tx = await prisma.transaction.create({
      data: {
        date: parsed.date,
        description: parsed.description,
        amount: parsed.amount,
        balance: parsed.balance,
        confidence: parsed.confidence,
        userId: user.id,
        organizationId,
      },
    });

    return c.json(tx, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 401);
  }
});

app.post("/", async (c) => {
  try {
    const { user, organizationId } = await requireOrg(c);
    const { date, description, amount, balance, confidence } = await c.req.json();

    if (!date || !description || amount === undefined) {
      return c.json({ error: "Date, description, and amount are required" }, 400);
    }

    const tx = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        amount,
        balance: balance ?? null,
        confidence: confidence ?? 100,
        userId: user.id,
        organizationId,
      },
    });

    return c.json(tx, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 401);
  }
});

app.get("/", async (c) => {
  try {
    const { organizationId } = await requireOrg(c);

    const transactions = await prisma.transaction.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return c.json(transactions);
  } catch (e: any) {
    return c.json({ error: e.message }, 401);
  }
});

export default app;
