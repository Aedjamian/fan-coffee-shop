import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "./auth-config";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return session;
}
