import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";

const app = new Hono();

app.use("*", cors());

app.all("*", async (c) => {
  if (!c.req.path.startsWith("/api/auth")) {
    return c.req.path === "/" ? c.text("Vessfly API") : c.text("Not Found", 404);
  }
  return auth.handler(c.req.raw as Request);
});

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
