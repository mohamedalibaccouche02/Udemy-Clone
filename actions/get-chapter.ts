import { db } from "src/server/db";
import {
  attachments,
  chapters,
  courses,
  muxData,
  purchases,
  userProgress,
} from "src/server/db/schema";
import { and, eq, gt } from "drizzle-orm";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    // 1. Check if the user purchased the course
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(
        and(eq(purchases.userId, userId), eq(purchases.courseId, courseId))
      );

    // 2. Get course info (only if published)
    const [course] = await db
      .select({
        price: courses.price,
      })
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isPublished, true)));

    // 3. Get chapter info (only if published)
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(and(eq(chapters.id, chapterId), eq(chapters.isPublished, true)));

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    let mux = null;
    let courseAttachments: typeof attachments.$inferSelect[] = [];
    let nextChapter = null;

    // 4. Load attachments if purchased
    if (purchase) {
      courseAttachments = await db
        .select()
        .from(attachments)
        .where(eq(attachments.courseId, courseId));
    }

    // 5. Load muxData + nextChapter if free or purchased
    if (chapter.isFree || purchase) {
      const [muxDataResult] = await db
        .select()
        .from(muxData)
        .where(eq(muxData.chapterId, chapterId));
      mux = muxDataResult ?? null;

      const [next] = await db
        .select()
        .from(chapters)
        .where(
          and(
            eq(chapters.courseId, courseId),
            eq(chapters.isPublished, true),
            gt(chapters.position, chapter.position)
          )
        )
        .orderBy(chapters.position);
      nextChapter = next ?? null;
    }

    // 6. Load user progress
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.chapterId, chapterId)
        )
      );

    return {
      chapter,
      course,
      muxData: mux,
      attachments: courseAttachments,
      nextChapter,
      userProgress: progress ?? null,
      purchase: purchase ?? null,
    };
  } catch (error) {
    console.error("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
