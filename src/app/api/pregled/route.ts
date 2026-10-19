import { NextResponse } from "next/server";
import { calendarDay } from "@/lib/calendar";
import { recordSiteView } from "@/lib/site-views";

const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|lighthouse|headless|pingdom|uptimerobot|bytespider/i;

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export async function POST(request: Request) {
  try {
    const agent = request.headers.get("user-agent") || "";
    if (BOT.test(agent)) {
      return NextResponse.json({ ok: true });
    }

    let path = "/";
    try {
      const body = (await request.json()) as { path?: unknown };
      if (typeof body.path === "string" && body.path.length < 200) {
        path = body.path;
      }
    } catch {
      return NextResponse.json({ ok: true });
    }

    let visitor = cookieValue(request, "mwl_vid");
    if (!/^[a-z0-9-]{8,80}$/i.test(visitor)) {
      visitor = crypto.randomUUID();
    }
    const today = calendarDay();
    const uniqueDay = cookieValue(request, "mwl_seen") !== today;

    await recordSiteView({ path, visitor, uniqueDay });

    const cookie = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    const response = NextResponse.json({ ok: true });
    response.cookies.set("mwl_vid", visitor, {
      ...cookie,
      maxAge: 60 * 60 * 24 * 400,
    });
    response.cookies.set("mwl_seen", today, {
      ...cookie,
      maxAge: 60 * 60 * 36,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: true });
  }
}
