import { verifyAppJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  if (req.method == "GET") {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  if (!token) {
    return unauthorized();
  }

  try {
    const payload = await verifyAppJwt(token);

    const allowed = (process.env.ALLOWED_EMAILS ?? "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (!payload.email || !allowed.includes(payload.email.toLowerCase())) {
      return unauthorized();
    }

    const res = NextResponse.next();
    return res;
  } catch {
    return unauthorized();
  }
}

function unauthorized() {
  return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
