import { getBaseUrl, randomString, setCookie } from "@/lib/http";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${getBaseUrl()}/api/auth/google/callback`;
  const state = randomString(24);

  // 10 min state cookie
  await setCookie("oauth_state", state, 10 * 60);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    include_granted_scopes: "true",
    state,
    prompt: "consent", // ensures refresh token first time; harmless otherwise
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}
