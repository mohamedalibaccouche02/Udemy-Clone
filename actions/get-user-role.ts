"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "src/server/db";
import { users } from "src/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserRoleAction() {
  const { userId } = await auth();
  if (!userId) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user?.role ?? null;
}
