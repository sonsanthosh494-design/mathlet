import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, school, classLevel, rollNumber, academicYear } = body;
    if (!email || !password || !name || !school || !classLevel || !rollNumber || !academicYear) return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({ data: { email: email.toLowerCase(), passwordHash, learner: { create: { name, academicRecords: { create: { school, classLevel: Number(classLevel), rollNumber, academicYear, status: "PENDING" } } } } } });
    return NextResponse.json({ id: user.id, message: "Account created. Academic details await admin approval." }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create account." }, { status: 500 }); }
}
