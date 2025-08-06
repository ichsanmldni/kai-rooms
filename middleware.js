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

  // ⚠️ Jika belum login (tidak ada token) dan bukan halaman login, redirect ke /login
  if (!token && pathname !== "/login" && pathname !== "/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Jika sudah login dan akses /login atau /, redirect ke /dashboard
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      if (pathname === "/login" || pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (err) {
      console.error("Token decode error:", err);
      // Jika token rusak, paksa logout
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|public|api).*)"], // Hindari eksekusi middleware di path tertentu
};
