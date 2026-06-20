import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getSession(c: any) {
  return auth.api.getSession({ headers: c.req.raw.headers });
}

export async function requireOrg(c: any) {
  const session = await getSession(c);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const organizationId = c.req.header("x-organization-id");
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const member = await prisma.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  if (!member) {
    throw new Error("Not a member of this organization");
  }

  return { user: session.user, organizationId, role: member.role };
}
