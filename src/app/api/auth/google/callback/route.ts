import { clearCookie, getBaseUrl, setCookie } from "@/lib/http";
import { signAppJwt } from "@/lib/jwt";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = (await cookies()).get("oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json({ error: "Invalid state or code" }, { status: 400 });
  }

  // one-time: drop state cookie
  clearCookie("oauth_state");

  const client_id = process.env.GOOGLE_CLIENT_ID!;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirect_uri = `${getBaseUrl()}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: "Token exchange failed", detail: err }, { status: 400 });
    }

  const tokenJson = await tokenRes.json() as {
    id_token: string;
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
  };

  // Verify Google's id_token so we can trust the email claim
  const { payload: googlePayload } = await jwtVerify(
    tokenJson.id_token,
    GOOGLE_JWKS,
    {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: client_id,
    }
  );

  const email = googlePayload.email as string | undefined;
  const emailVerified = googlePayload.email_verified as boolean | undefined;
  const sub = googlePayload.sub as string | undefined;
  const name = (googlePayload.name as string) || undefined;
  const picture = (googlePayload.picture as string) || undefined;

  if (!email || !emailVerified || !sub) {
    return NextResponse.json({ error: "Email not available/verified" }, { status: 403 });
  }

  // Allow-list check
  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email.toLowerCase())) {
    return NextResponse.json({ error: "User not allowed" }, { status: 403 });
  }

  // Issue our app session JWT (7 days)
  const appJwt = await signAppJwt({ sub, email, name, picture }, "7d");
  // 7 days in seconds
  const maxAge = 7 * 24 * 60 * 60;
  await setCookie("session", appJwt, maxAge, "/");

  // Redirect into your app
  const to = `${getBaseUrl()}/manage`;
  return NextResponse.redirect(to);
}
