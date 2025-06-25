import { db } from "src/server/db";
import { users } from "src/server/db/schema";
import { isAdmin } from "src/lib/roles";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userIdToUpdate = params.id;
  const { role } = await req.json();

  if (!["admin", "teacher", "student"].includes(role)) {
    return new NextResponse("Invalid role", { status: 400 });
  }

  const isRequesterAdmin = await isAdmin();
  if (!isRequesterAdmin) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db.update(users)
    .set({ role })
    .where(eq(users.id, userIdToUpdate));

  return new NextResponse("Role updated", { status: 200 });
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userIdToDelete = params.id;

  const isRequesterAdmin = await isAdmin();
  if (!isRequesterAdmin) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  await db.delete(users).where(eq(users.id, userIdToDelete));

  return new NextResponse("User deleted", { status: 200 });
}