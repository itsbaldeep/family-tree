import { clearCookie } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST() {
  await clearCookie("session", "/");
  return NextResponse.json({ ok: true });
}
