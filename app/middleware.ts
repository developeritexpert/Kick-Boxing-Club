import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleDashboards: Record<string, string> = {
  admin: "/admin/dashboard",
  content_admin: "/content-admin/dashboard",
  instructor: "/instructor/dashboard",
  user: "/dashboard",
};

const publicRoutes = ["/", "/auth/login", "/auth/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("sb-access-token")?.value;

  if (token) {
    if (publicRoutes.includes(pathname)) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
        const role = payload.role || "user";

        const redirectTo = roleDashboards[role] || "/dashboard";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      } catch (err) {
        const res = NextResponse.redirect(new URL("/auth/login", req.url));
        res.cookies.delete("sb-access-token");
        return res;
      }
    }
    return NextResponse.next();
  } else {
    if (!publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
