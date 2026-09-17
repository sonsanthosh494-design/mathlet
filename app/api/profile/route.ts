import { NextResponse } from "next/server";
import { db } from "../../../lib/prisma";
import { getSessionUserId } from "../../../lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "You must sign in." }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: userId }, include: { learner: { include: { academicRecords: { orderBy: { academicYear: "desc" } } } } } });
  if (!user?.learner) return NextResponse.json({ error: "Learner profile not found." }, { status: 404 });
  return NextResponse.json({ email: user.email, name: user.learner.name, records: user.learner.academicRecords });
}
