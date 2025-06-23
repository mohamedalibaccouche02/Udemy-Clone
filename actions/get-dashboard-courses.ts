import { db } from "src/server/db";
import { purchases, courses, categories, chapters } from "src/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getProgress } from "actions/get-progress";
import type { CourseWithProgressWithCategory } from "src/types";

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    const userPurchases = await db
      .select({
        courseId: purchases.courseId,
      })
      .from(purchases)
      .where(eq(purchases.userId, userId));

    const courseIds = userPurchases.map((p) => p.courseId);
    if (courseIds.length === 0) {
      return {
        completedCourses: [],
        coursesInProgress: [],
      };
    }

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
      .where(inArray(courses.id, courseIds));

    // Fetch all chapters in one query
    const allChapters = await db
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
      .where(inArray(chapters.courseId, courseIds));

    const courseChapterMap = allChapters.reduce((map, chapter) => {
      if (!map[chapter.courseId]) {
        map[chapter.courseId] = [];
      }
      (map[chapter.courseId] ??= []).push(chapter);
      return map;
    }, {} as Record<string, { id: string; title: string; description: string | null; videoUrl: string | null; position: number; isPublished: boolean; isFree: boolean; courseId: string; createdAt: Date; updatedAt: Date | null }[]>);

    const enrichedCourses: CourseWithProgressWithCategory[] = await Promise.all(
      rawCourses.map(async (course) => {
        const progress = await getProgress(userId, course.id);
        return {
          ...course,
          chapters: courseChapterMap[course.id] || [],
          progress,
          attachments: [],
          purchases: [],
        };
      })
    );

    const completedCourses = enrichedCourses.filter(
      (course) => course.progress === 100
    );

    const coursesInProgress = enrichedCourses.filter(
      (course) => (course.progress ?? 0) < 100
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};