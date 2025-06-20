import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]); // Ensure both routes are public

export default clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;

  // Skip authentication for API routes that handle their own auth
  if (nextUrl.pathname.startsWith("/api/uploadthing") || nextUrl.pathname.startsWith("/api/webhooks")) {
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};