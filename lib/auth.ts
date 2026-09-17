import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./prisma";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  learner?: {
    name: string | null;
  } | null;
};

export async function getSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mathlet_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.userId === "string"
      ? { userId: payload.userId, role: typeof payload.role === "string" ? payload.role : undefined }
      : null;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await getSessionPayload();
  return session?.userId ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        learner: {
          select: { name: true },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user?.role === "ADMIN" ? user : null;
}
