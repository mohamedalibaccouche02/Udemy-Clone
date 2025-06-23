import { db } from "src/server/db";
import { redirect } from "next/navigation";
import { courses, chapters } from "src/server/db/schema";
import { eq, and, asc } from "drizzle-orm";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  // Get the course by ID
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId),
  });

  if (!course) {
    return redirect("/");
  }

  // Get the first published chapter of this course, ordered by position
  const publishedChapters = await db
    .select()
    .from(chapters)
    .where(
      and(eq(chapters.courseId, course.id), eq(chapters.isPublished, true))
    )
    .orderBy(asc(chapters.position));

  if (!publishedChapters.length) {
    return redirect("/");
  }

  return redirect(`/courses/${course.id}/chapters/${publishedChapters[0]!.id}`);
};

export default CourseIdPage;
