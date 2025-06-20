import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "src/server/db";
import { userProgress } from "src/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isCompleted } = await req.json();

    // Check if user progress already exists
    const existing = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.chapterId, params.chapterId)))
      .then((res) => res[0]);

    let result;

    if (existing) {
      // Update existing progress
      result = await db
        .update(userProgress)
        .set({ isCompleted })
        .where(and(eq(userProgress.userId, userId), eq(userProgress.chapterId, params.chapterId)))
        .returning()
        .then((res) => res[0]);
    } else {
      // Create new progress entry
      result = await db
        .insert(userProgress)
        .values({
          userId,
          chapterId: params.chapterId,
          isCompleted,
        })
        .returning()
        .then((res) => res[0]);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
