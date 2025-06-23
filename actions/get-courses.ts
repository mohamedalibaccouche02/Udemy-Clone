import { db } from "src/server/db";
import { courses, categories, chapters, purchases } from "src/server/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { getProgress } from "actions/get-progress";
import type { CourseWithRelations } from "src/server/db"; // Import the shared type

type CourseWithProgressWithCategory = CourseWithRelations & {
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    // Build the WHERE clause dynamically
    const whereConditions = [eq(courses.isPublished, true)];

    if (title) {
      whereConditions.push(ilike(courses.title, `%${title}%`));
    }

    if (categoryId) {
      whereConditions.push(eq(courses.categoryId, categoryId));
    }

    // Fetch courses with category and chapters (isPublished = true)
    const rawCourses = await db
      .select({
        id: courses.id,
        userId: courses.userId,
        title: courses.title,
        description: courses.description,
        imageUrl: courses.imageUrl,
        price: courses.price,
        isPublished: courses.isPublished,
        categoryId: courses.categoryId,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(and(...whereConditions))
      .orderBy(courses.createdAt);

    const coursesWithProgress: CourseWithProgressWithCategory[] = await Promise.all(
      rawCourses.map(async (course) => {
        const publishedChapters = await db
          .select({
            id: chapters.id,
            title: chapters.title,
            description: chapters.description,
            videoUrl: chapters.videoUrl,
            position: chapters.position,
            isPublished: chapters.isPublished,
            isFree: chapters.isFree,
            courseId: chapters.courseId,
            createdAt: chapters.createdAt,
            updatedAt: chapters.updatedAt,
          })
          .from(chapters)
          .where(and(eq(chapters.courseId, course.id), eq(chapters.isPublished, true)));

        const hasPurchased = await db.query.purchases.findFirst({
          where: and(eq(purchases.userId, userId), eq(purchases.courseId, course.id)),
        });

        const progress = hasPurchased
          ? await getProgress(userId, course.id)
          : null;

        return {
          ...course,
          chapters: publishedChapters,
          progress,
          attachments: [], // Empty array, typed as Attachment[]
          purchases: [], // Empty array, typed as Purchase[]
        };
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return [];
  }
};