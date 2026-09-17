import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { db } from "../../../../lib/prisma";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await db.user.findUnique({ where: { email: email?.toLowerCase() } });
  if (!user?.passwordHash || !(await bcrypt.compare(password ?? "", user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "AUTH_SECRET is not configured." }, { status: 500 });
  const token = await new SignJWT({ userId: user.id, role: user.role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(new TextEncoder().encode(secret));
  const response = NextResponse.json({ message: "Signed in successfully." });
  response.cookies.set("mathlet_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
  return response;
}
