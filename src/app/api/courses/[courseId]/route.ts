import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { courses } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = await auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [updatedCourse] = await db
      .update(courses)
      .set({ ...values })
      .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
      .returning();

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
