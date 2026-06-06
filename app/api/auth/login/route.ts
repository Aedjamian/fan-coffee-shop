import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  assertAuthConfig,
  getAdminCredentials,
} from "@/lib/auth-config";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    assertAuthConfig();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Auth is not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let username = "";
  let password = "";
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    username = body.username?.trim() ?? "";
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const creds = getAdminCredentials();
  const userOk = safeEqual(username, creds.username);
  const passOk = safeEqual(password, creds.password);

  if (!userOk || !passOk) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.username = creds.username;
  await session.save();

  return NextResponse.json({ ok: true });
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
