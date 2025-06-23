import { db } from "src/server/db";
import { chapters, userProgress } from "src/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";

/**
 * Get the percentage progress of a user in a given course
 */
export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    // 1. Get all published chapter IDs for the course
    const publishedChapters = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(and(eq(chapters.courseId, courseId), eq(chapters.isPublished, true)));

    const publishedChapterIds = publishedChapters.map(ch => ch.id);

    if (publishedChapterIds.length === 0) return 0;

    // 2. Count user progress where chapters are completed
    const validCompletedChapters = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.isCompleted, true),
          inArray(userProgress.chapterId, publishedChapterIds)
        )
      );

    const progressPercentage =
      (validCompletedChapters.length / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.error("[GET_PROGRESS]", error);
    return 0;
  }
};
