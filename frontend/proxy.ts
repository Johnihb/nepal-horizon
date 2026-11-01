import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const authRoutes = ["/login", "/signup"];

const protectedRoutes = ["/dashboard", "/admin", "/upload", "/bookings"];

const is = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

/**
 * Signed-out visitors are bounced here — no backend call, just the cookie.
 * The ADMIN role is checked in the (admin) layout, where the session is
 * already cached, so this never costs a round trip.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Logged-in users have no business on the auth screens.
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/packages", request.url));
  }

  if (authRoutes.includes(pathname)) return NextResponse.next();

  if (!protectedRoutes.some((route) => is(pathname, route))) return NextResponse.next();

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/admin/:path*",
    "/upload/:path*",
    "/bookings/:path*",
  ],
};
