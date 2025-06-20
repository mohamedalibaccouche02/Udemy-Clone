import { db } from "src/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { courses } from "~/server/db/schema";
// import { isTeacher } from "@/lib/teacher";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // Parse the request body
    const { title } = await req.json();

    // Check if the user is authenticated and a teacher
    if (!userId ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Insert a new course using Drizzle ORM
    const [course] = await db
      .insert(courses)
      .values({
        userId,
        title,
      })
      .returning();

    // Return the created course
    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
