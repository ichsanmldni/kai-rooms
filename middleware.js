import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authKAI")?.value;

  // CORS headers (untuk API / optional)
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Tangani request OPTIONS (CORS preflight)
  if (request.method === "OPTIONS") {
    return response;
  }

  // ⚠️ Skip middleware for static files, public assets, or API routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return response;
  }

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    // If no token and trying to access admin pages except login, redirect to admin login
    if (!token && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // If has token and accessing admin login, redirect to admin dashboard
    if (token && pathname === "/admin/login") {
      try {
        const decoded = jwtDecode(token);
        // Optional: Check if user has admin role
        // if (decoded.role !== 'admin') {
        //   return NextResponse.redirect(new URL("/unauthorized", request.url));
        // }
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch (err) {
        console.error("Token decode error:", err);
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return response;
  }

  // Handle regular user routes
  // Handle regular user routes
  if (
    !token &&
    pathname !== "/login" &&
    pathname !== "/register" &&
    pathname !== "/login/lupa-password" &&
    !pathname.startsWith("/login/reset-password")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (pathname === "/login" || pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (err) {
      console.error("Token decode error:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|public|api).*)"],
};
