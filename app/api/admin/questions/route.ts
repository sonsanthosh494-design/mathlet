import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const questions = await db.question.findMany({
    include: {
      exercise: {
        select: {
          exerciseNumber: true,
          language: true,
          sectionId: true,
          chapterNumber: true,
        },
      },
      translations: true,
      blocks: true,
    },
    orderBy: [{ exerciseId: "asc" }, { orderIndex: "asc" }],
  });

  return NextResponse.json({ questions }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json();
  if (!body.questionId || !body.language || !body.prompt) {
    return NextResponse.json(
      { error: "Question, language, and prompt are required." },
      { status: 400 }
    );
  }

  let blocks: Array<Record<string, unknown>> = [];
  if (body.blocksJson?.trim()) {
    try {
      const parsed = JSON.parse(body.blocksJson);
      if (!Array.isArray(parsed)) throw new Error();
      blocks = parsed;
    } catch {
      return NextResponse.json(
        { error: "Blocks must be valid JSON array syntax." },
        { status: 400 }
      );
    }
  }

  const result = await db.$transaction(async (tx) => {
    const translation = await tx.questionTranslation.upsert({
      where: {
        questionId_language: {
          questionId: body.questionId,
          language: body.language,
        },
      },
      update: {
        prompt: body.prompt,
        given: body.given ?? null,
        answer: body.answer ?? null,
        solutionSummary: body.solutionSummary ?? null,
      },
      create: {
        questionId: body.questionId,
        language: body.language,
        prompt: body.prompt,
        given: body.given ?? null,
        answer: body.answer ?? null,
        solutionSummary: body.solutionSummary ?? null,
      },
    });

    await tx.contentBlock.deleteMany({
      where: { questionId: body.questionId, language: body.language },
    });

    if (blocks.length) {
      await tx.contentBlock.createMany({
        data: blocks.map((b, index) => ({
          questionId: body.questionId,
          language: body.language,
          orderIndex: index,
          blockType: String(b.blockType || "text"),
          text: b.text ? String(b.text) : null,
          latex: b.latex ? String(b.latex) : null,
          assetUrl: b.assetUrl ? String(b.assetUrl) : null,
          assetAlt: b.assetAlt ? String(b.assetAlt) : null,
          metadata: (b.metadata as object) ?? undefined,
        })),
      });
    }

    await tx.question.update({
      where: { id: body.questionId },
      data: { reviewStatus: body.reviewStatus ?? "CLEANED" },
    });

    return translation;
  });

  return NextResponse.json({ translation: result });
}
