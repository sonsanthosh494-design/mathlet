import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out successfully." });
  response.cookies.set("mathlet_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
}

export async function GET() {
  return POST();
}
