import { ManageView } from "@/components/manage";
import { verifyAppJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ManagePage() {
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    console.log("❌ No token found");
    redirect("/login")
  }

  try {
    const payload = await verifyAppJwt(token);

    const allowed = (process.env.ALLOWED_EMAILS ?? "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (!payload.email || !allowed.includes(payload.email.toLowerCase())) {
      console.log("❌ Email not allowed");
      redirect("/login")
    }

    return (
      <ManageView />
    )
  } catch (err) {
    console.log("❌ Some error occurred", err);
    redirect("/login")
  }
}
