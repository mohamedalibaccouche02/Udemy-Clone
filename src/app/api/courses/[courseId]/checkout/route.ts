import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";

import { db } from "src/server/db";
import { courses, purchases, stripeCustomers } from "src/server/db/schema";
import { stripe } from "src/lib/stripe";

import Stripe from "stripe";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch course
    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, params.courseId), eq(courses.isPublished, true)),
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Check if already purchased
    const existingPurchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, params.courseId)
      ),
    });

    if (existingPurchase) {
      return new NextResponse("Already purchased", { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(course.price! * 100),
        },
      },
    ];

    // Find Stripe customer
    let customerRecord = await db.query.stripeCustomers.findFirst({
      where: eq(stripeCustomers.userId, user.id),
    });

    // Create if not exist
    if (!customerRecord) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
      });

      const inserted = await db
        .insert(stripeCustomers)
        .values({
          userId: user.id,
          stripeCustomerId: customer.id,
        })
        .returning();

      customerRecord = inserted[0];
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerRecord.stripeCustomerId,
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[COURSE_ID_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
