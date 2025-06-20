import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { and, eq } from "drizzle-orm";

import { db } from "src/server/db";
import { courses, chapters, muxData } from "src/server/db/schema";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId } = params;
    const values = await req.json();

    const course = await db
      .update(courses)
      .set(values)
      .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
      .returning();

    if (!course[0]) return new NextResponse("Course not found", { status: 404 });

    return NextResponse.json(course[0]);
  } catch (error) {
    console.error("[COURSE_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId } = params;

    const courseWithChapters = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
      with: {
        chapters: {
          with: {
            muxData: true,
          },
        },
      },
    });

    if (!courseWithChapters) return new NextResponse("Not found", { status: 404 });

    for (const chapter of courseWithChapters.chapters) {
      if (chapter.muxData?.assetId) {
        await mux.video.assets.delete(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await db
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning();

    return NextResponse.json(deletedCourse[0]);
  } catch (error) {
    console.error("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
