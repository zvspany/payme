import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { DEFAULT_THEME_ID } from "@/lib/constants";
import { db } from "@/lib/db";
import { normalizeUsername, sanitizePlainText } from "@/lib/sanitize";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  // Rate limiting should be applied here (IP/email key) at proxy or middleware level in production.
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse({
    email: sanitizePlainText(String(body.email ?? "")).toLowerCase(),
    password: String(body.password ?? ""),
    username: normalizeUsername(String(body.username ?? "")),
    displayName: sanitizePlainText(String(body.displayName ?? ""))
  });

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const existingEmail = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true }
    });

    if (existingEmail) {
      return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
    }

    const existingUsername = await db.profile.findUnique({
      where: { username: parsed.data.username },
      select: { id: true }
    });

    if (existingUsername) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 });
    }

    const hashedPassword = await hash(parsed.data.password, 12);

    await db.$transaction(async (tx) => {
      const theme = await tx.theme.findUnique({ where: { id: DEFAULT_THEME_ID } });
      if (!theme) {
        throw new Error(`Missing default theme: ${DEFAULT_THEME_ID}`);
      }

      const user = await tx.user.create({
        data: {
          email: parsed.data.email,
          hashedPassword
        }
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          username: parsed.data.username,
          displayName: parsed.data.displayName,
          themeId: DEFAULT_THEME_ID,
          isPublic: true
        }
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { message: "Database is not reachable. Start PostgreSQL and run migrations first." },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Account already exists" }, { status: 409 });
    }

    return NextResponse.json({ message: "Could not create account" }, { status: 500 });
  }

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}
