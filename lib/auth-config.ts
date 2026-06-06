import type { SessionOptions } from "iron-session";

export type SessionData = {
  isLoggedIn: boolean;
  username?: string;
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "development-only-secret-min-32-characters-long",
  cookieName: "fan_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "",
  };
}

/** Local testing only — never set in production. */
export function isDevAdminBypassEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_ADMIN_BYPASS === "true"
  );
}

export function assertAuthConfig() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters.",
    );
  }
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD must be set.");
  }
}
