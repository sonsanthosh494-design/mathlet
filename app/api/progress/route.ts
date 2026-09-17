import { NextResponse } from "next/server";
import { db } from "../../../lib/prisma";
import { getSessionUserId } from "../../../lib/auth";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to sync progress." }, { status: 401 });
  const body = await request.json();
  if (!body.exerciseId) return NextResponse.json({ error: "Exercise id is required." }, { status: 400 });
  const learner = await db.learner.findUnique({ where: { userId }, select: { id: true } });
  if (!learner) return NextResponse.json({ error: "Learner profile not found." }, { status: 404 });
  const progress = await db.exerciseProgress.upsert({
    where: { learnerId_exerciseId: { learnerId: learner.id, exerciseId: body.exerciseId } },
    update: { answer: body.answer ?? null, status: body.status ?? "COMPLETED", completedAt: body.status === "COMPLETED" ? new Date() : null },
    create: { learnerId: learner.id, exerciseId: body.exerciseId, answer: body.answer ?? null, status: body.status ?? "COMPLETED", completedAt: body.status === "COMPLETED" ? new Date() : null }
  });
  return NextResponse.json({ progress });
}
