import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentSession() {
  return auth();
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function requireCurrentUser() {
  const session = await requireSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}
