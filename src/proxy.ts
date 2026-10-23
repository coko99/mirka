import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, verifyPreviewToken } from "@/lib/preview-auth";

const ADMIN_COOKIE = "mirka_admin";
const PUBLIC_FILE = /\.[^/]+$/;

function withPath(request: NextRequest, pathname: string) {
  const headers = new Headers(request.headers);
  headers.set("x-mirka-path", pathname);
  return headers;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const headers = withPath(request, pathname);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLogin = pathname === "/admin/login";
    const hasCookie = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!hasCookie && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request: { headers } });
  }

  const previewOk = await verifyPreviewToken(
    request.cookies.get(PREVIEW_COOKIE)?.value,
  );

  if (pathname === "/uskoro") {
    if (previewOk) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request: { headers } });
  }

  if (!previewOk) {
    const url = request.nextUrl.clone();
    url.pathname = "/uskoro";
    url.search = "";
    headers.set("x-mirka-path", "/uskoro");
    return NextResponse.rewrite(url, { request: { headers } });
  }

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
