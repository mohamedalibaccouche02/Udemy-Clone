import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "src/server/db";
import { courses, chapters } from "src/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Ensure the user owns the course
    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, params.courseId), eq(courses.userId, userId)))
      .then((res) => res[0]);

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Unpublish the chapter
    const updated = await db
      .update(chapters)
      .set({ isPublished: false })
      .where(and(eq(chapters.id, params.chapterId), eq(chapters.courseId, params.courseId)))
      .returning()
      .then((res) => res[0]);

    // 3. Check if there are still any published chapters in the course
    const publishedChapters = await db
      .select()
      .from(chapters)
      .where(and(eq(chapters.courseId, params.courseId), eq(chapters.isPublished, true)));

    if (publishedChapters.length === 0) {
      await db
        .update(courses)
        .set({ isPublished: false })
        .where(eq(courses.id, params.courseId));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
