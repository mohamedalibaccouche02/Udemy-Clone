import { db } from "~/server/db";
import { attachments, courses } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isTeacher } from "src/lib/teacher";


export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    const { courseId } = params;
    const { url } = await req.json();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the course belongs to the current user
    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
      .then((res) => res[0]);

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const name = url.split("/").pop() || "attachment";

    const [attachment] = await db
      .insert(attachments)
      .values({
        url,
        name,
        courseId,
      })
      .returning();

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
