import { NextResponse } from "next/server";
import {
  getAdminCredentials,
  isDevAdminBypassEnabled,
} from "@/lib/auth-config";
import { getSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json({ enabled: isDevAdminBypassEnabled() });
}

export async function POST() {
  if (!isDevAdminBypassEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const creds = getAdminCredentials();
  const session = await getSession();
  session.isLoggedIn = true;
  session.username = `${creds.username} (dev bypass)`;
  await session.save();

  return NextResponse.json({ ok: true });
}
