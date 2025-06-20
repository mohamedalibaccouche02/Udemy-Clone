import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "src/server/db";
import { courses, chapters, muxData } from "src/server/db/schema";
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

    // 2. Fetch the chapter
    const chapter = await db
      .select()
      .from(chapters)
      .where(and(eq(chapters.id, params.chapterId), eq(chapters.courseId, params.courseId)))
      .then((res) => res[0]);

    // 3. Fetch mux data
    const mux = await db
      .select()
      .from(muxData)
      .where(eq(muxData.chapterId, params.chapterId))
      .then((res) => res[0]);

    // 4. Ensure all fields exist
    if (!chapter || !mux || !chapter.title || !chapter.description || !chapter.videoUrl) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 5. Publish chapter
    const updated = await db
      .update(chapters)
      .set({ isPublished: true })
      .where(and(eq(chapters.id, params.chapterId), eq(chapters.courseId, params.courseId)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
