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


export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "You must sign in." }, { status: 401 });
  const body = await request.json();
  if (!body.school || !body.classLevel || !body.rollNumber || !body.academicYear) return NextResponse.json({ error: "All academic fields are required." }, { status: 400 });
  const learner = await db.learner.findUnique({ where: { userId }, select: { id: true } });
  if (!learner) return NextResponse.json({ error: "Learner profile not found." }, { status: 404 });
  const record = await db.academicRecord.upsert({
    where: { learnerId_academicYear: { learnerId: learner.id, academicYear: body.academicYear } },
    update: { school: body.school, classLevel: Number(body.classLevel), rollNumber: body.rollNumber, status: "PENDING", reviewedAt: null, requestedAt: new Date() },
    create: { learnerId: learner.id, school: body.school, classLevel: Number(body.classLevel), rollNumber: body.rollNumber, academicYear: body.academicYear, status: "PENDING" }
  });
  return NextResponse.json({ record, message: "Update request submitted for admin approval." });
}
