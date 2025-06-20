import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "src/server/db";
import { courses, chapters } from "src/server/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch course with chapters (each with muxData)
    const courseWithChapters = await db.query.courses.findFirst({
      where: and(eq(courses.id, params.courseId), eq(courses.userId, userId)),
      with: {
        chapters: {
          with: {
            muxData: true,
          },
        },
      },
    });

    if (!courseWithChapters) {
      return new NextResponse("Not found", { status: 404 });
    }

    const hasPublishedChapter = courseWithChapters.chapters.some(
      (chapter) => chapter.isPublished
    );

    if (
      !courseWithChapters.title ||
      !courseWithChapters.description ||
      !courseWithChapters.imageUrl ||
      !courseWithChapters.categoryId ||
      !hasPublishedChapter
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Publish the course
    const updated = await db
      .update(courses)
      .set({ isPublished: true })
      .where(
        and(
          eq(courses.id, params.courseId),
          eq(courses.userId, userId)
        )
      )
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[COURSE_ID_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
