import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

export async function setCookie(name: string, value: string, maxAgeSeconds: number, path = "/") {
  (await cookies()).set({
    name,
    value,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path,
    maxAge: maxAgeSeconds,
  });
}

export async function clearCookie(name: string, path = "/") {
  (await cookies()).set({
    name,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path,
    maxAge: 0,
  });
}

export function getBaseUrl() {
  // Prefer APP_URL (works locally and in prod)
  return process.env.APP_URL!;
}

export function randomString(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}
