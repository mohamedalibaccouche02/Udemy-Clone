import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "src/server/db";
import { courses } from "src/server/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify ownership
    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, params.courseId), eq(courses.userId, userId)),
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const updated = await db
      .update(courses)
      .set({ isPublished: false })
      .where(and(eq(courses.id, params.courseId), eq(courses.userId, userId)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[COURSE_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
