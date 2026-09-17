import { NextResponse } from "next/server";
import { db } from "../../../../lib/prisma";
import { getSessionUserId } from "../../../../lib/auth";

async function requireAdmin() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const records = await db.academicRecord.findMany({ include: { learner: { select: { name: true, user: { select: { email: true } } } } }, orderBy: { requestedAt: "desc" } });
  return NextResponse.json({ records });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Record id is required." }, { status: 400 });
  const record = await db.academicRecord.update({ where: { id: body.id }, data: { school: body.school, classLevel: Number(body.classLevel), rollNumber: body.rollNumber, academicYear: body.academicYear, status: body.status ?? "APPROVED", reviewedAt: new Date() } });
  return NextResponse.json({ record });
}
