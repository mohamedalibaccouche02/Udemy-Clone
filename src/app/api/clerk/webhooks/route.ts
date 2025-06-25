import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "src/server/db";
import { users } from "src/server/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔔 Clerk webhook triggered");

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing Clerk Webhook Secret in environment");
    return new Response("Missing Clerk Webhook Secret", { status: 400 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("📦 Incoming headers:", {
    svix_id,
    svix_timestamp,
    svix_signature,
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing required Svix headers");
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log("📨 Raw webhook payload:", body);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("✅ Webhook verified. Event type:", evt.type);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new Response("Unauthorized", { status: 401 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    console.log("👤 Creating user:", { id, email });

    if (!id || !email) {
      console.error("❌ Missing user ID or email in payload");
      return new Response("Missing user data", { status: 400 });
    }

    await db.insert(users).values({
      id,
      email,
      role: "student", // Default role
    });

    console.log("✅ User inserted into database with default role: student");

    return new Response("User created successfully", { status: 200 });
  }

  console.log("ℹ️ Event not handled:", evt.type);
  return new Response("Event ignored", { status: 200 });
}
