import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "mirka_admin";

const PUBLIC_FILE = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLogin = pathname === "/admin/login";
    const hasCookie = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!hasCookie && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);

  if (pathname === "/sr" || pathname.startsWith("/sr/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/sr/, "") || "/";
    return NextResponse.redirect(url);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    headers.set("x-locale", "en");
    return NextResponse.next({ request: { headers } });
  }

  headers.set("x-locale", "sr");
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/sr" : `/sr${pathname}`;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
