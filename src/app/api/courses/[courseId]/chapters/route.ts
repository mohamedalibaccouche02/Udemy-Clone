import { db } from "src/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { chapters, courses } from "src/server/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();

    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check course ownership
    const courseOwner = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, params.courseId), eq(courses.userId, userId)))
      .then((res) => res[0]);

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get last chapter by position
    const lastChapter = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, params.courseId))
      .orderBy(desc(chapters.position))
      .limit(1)
      .then((res) => res[0]);

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    // Insert new chapter
    const [newChapter] = await db
      .insert(chapters)
      .values({
        title,
        courseId: params.courseId,
        position: newPosition,
      })
      .returning();

    return NextResponse.json(newChapter);
  } catch (error) {
    console.error("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
