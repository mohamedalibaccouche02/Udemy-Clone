import { db } from "~/server/db";
import { attachments, courses } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const { userId } = await auth();
    const { courseId, attachmentId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Authorization: make sure the course belongs to this user
    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
      .then((res) => res[0]);

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [deletedAttachment] = await db
      .delete(attachments)
      .where(and(eq(attachments.id, attachmentId), eq(attachments.courseId, courseId)))
      .returning();

    return NextResponse.json(deletedAttachment);
  } catch (error) {
    console.error("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
