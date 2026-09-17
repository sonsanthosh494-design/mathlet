import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function getSessionUserId() {
  const token = (await cookies()).get("mathlet_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;
  try { const { payload } = await jwtVerify(token, new TextEncoder().encode(secret)); return typeof payload.userId === "string" ? payload.userId : null; } catch { return null; }
}
