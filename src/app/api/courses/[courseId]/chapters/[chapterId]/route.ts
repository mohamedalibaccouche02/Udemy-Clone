import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { and, eq } from "drizzle-orm";

import { db } from "src/server/db";
import { courses, chapters, muxData } from "src/server/db/schema";

// Initialize Mux with video client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Await params to resolve courseId and chapterId
    const { courseId, chapterId } = await params;

    const { isPublished, ...values } = await req.json();

    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
    });
    if (!course) return new NextResponse("Unauthorized", { status: 401 });

    const updated = await db
      .update(chapters)
      .set(values)
      .where(
        and(eq(chapters.id, chapterId), eq(chapters.courseId, courseId))
      )
      .returning();

    const chapter = updated[0];

    if (values.videoUrl) {
      const existingMux = await db.query.muxData.findFirst({
        where: eq(muxData.chapterId, chapterId),
      });

      if (existingMux) {
        await mux.video.assets.delete(existingMux.assetId); // Updated to use mux.video.assets.delete
        await db.delete(muxData).where(eq(muxData.id, existingMux.id));
      }

      const asset = await mux.video.assets.create({
        inputs: [{ url: values.videoUrl }], // Corrected property name to 'inputs'
        playback_policy: ["public"], // Updated to array format
        test: false,
      });

      await db.insert(muxData).values({
        chapterId: chapterId,
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id ?? "",
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[COURSES_CHAPTER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Await params to resolve courseId and chapterId
    const { courseId, chapterId } = await params;

    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
    });
    if (!course) return new NextResponse("Unauthorized", { status: 401 });

    const chapter = await db.query.chapters.findFirst({
      where: and(eq(chapters.id, chapterId), eq(chapters.courseId, courseId)),
    });
    if (!chapter) return new NextResponse("Not Found", { status: 404 });

    if (chapter.videoUrl) {
      const existingMux = await db.query.muxData.findFirst({
        where: eq(muxData.chapterId, chapterId),
      });

      if (existingMux) {
        await mux.video.assets.delete(existingMux.assetId); // Updated to use mux.video.assets.delete
        await db.delete(muxData).where(eq(muxData.id, existingMux.id));
      }
    }

    const deleted = await db
      .delete(chapters)
      .where(eq(chapters.id, chapterId))
      .returning();

    const publishedChapters = await db.query.chapters.findMany({
      where: and(
        eq(chapters.courseId, courseId),
        eq(chapters.isPublished, true)
      ),
    });

    if (!publishedChapters.length) {
      await db
        .update(courses)
        .set({ isPublished: false })
        .where(eq(courses.id, courseId));
    }

    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}