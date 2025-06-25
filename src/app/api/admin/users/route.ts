import { db } from "src/server/db";
import { users } from "src/server/db/schema";
import { isAdmin } from "src/lib/roles";
import { NextResponse } from "next/server";

export async function GET() {
  const isRequesterAdmin = await isAdmin();
  if (!isRequesterAdmin) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}
