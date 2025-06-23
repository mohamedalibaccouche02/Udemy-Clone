import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "src/server/db";
import { courses } from "src/server/db/schema";

import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { desc, eq } from "drizzle-orm";

const CoursesPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch all courses for the logged-in user, sorted by most recent
  const userCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.userId, userId))
    .orderBy(desc(courses.createdAt));

  return (
    <div className="p-6">
      <DataTable columns={columns} data={userCourses} />
    </div>
  );
};

export default CoursesPage;
