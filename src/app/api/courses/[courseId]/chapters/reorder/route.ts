import { db } from "src/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { courses, chapters } from "src/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    // Authorization: verify course ownership
    const courseOwner = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, params.courseId), eq(courses.userId, userId)))
      .then((res) => res[0]);

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update position for each chapter
    for (const item of list) {
      await db
        .update(chapters)
        .set({ position: item.position })
        .where(eq(chapters.id, item.id));
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
