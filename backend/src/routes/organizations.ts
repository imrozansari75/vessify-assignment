import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { getSession } from "../lib/org";

const app = new Hono();

app.post("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const { name } = await c.req.json();
  if (!name) return c.json({ error: "Name is required" }, 400);

  const org = await prisma.organization.create({
    data: {
      name,
      members: {
        create: {
          userId: session.user.id,
          role: "admin",
        },
      },
    },
  });

  return c.json(org, 201);
});

app.get("/", async (c) => {
  const session = await getSession(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const orgs = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  return c.json(orgs);
});

export default app;
