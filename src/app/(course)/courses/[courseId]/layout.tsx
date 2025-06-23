import { db } from "src/server/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getProgress } from "actions/get-progress";

import { chapters, courses, userProgress } from "src/server/db/schema";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } =await auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch the course by ID
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId),
  });

  if (!course) {
    return redirect("/");
  }

  // Fetch published chapters with user progress for this user
  const chapterList = await db.query.chapters.findMany({
    where: eq(chapters.courseId, course.id),
    with: {
      userProgress: {
        where: eq(userProgress.userId, userId),
      },
    },
    orderBy: (chapters, { asc }) => [asc(chapters.position)],
  });

  const progressCount = await getProgress(userId, course.id);

  const courseWithChapters = {
    ...course,
    chapters: chapterList,
  };

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={courseWithChapters} progressCount={progressCount} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={courseWithChapters} progressCount={progressCount} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
