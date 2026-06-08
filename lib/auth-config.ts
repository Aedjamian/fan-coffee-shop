import { timingSafeEqual } from "crypto";
import type { SessionOptions } from "iron-session";

export type SessionData = {
  isLoggedIn: boolean;
  username?: string;
};

export type AdminAccount = {
  username: string;
  password: string;
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

/** All admin logins from ADMIN_USERS JSON and/or ADMIN_USERNAME + ADMIN_PASSWORD. */
export function getAdminAccounts(): AdminAccount[] {
  const accounts: AdminAccount[] = [];
  const seen = new Set<string>();

  const rawUsers = process.env.ADMIN_USERS?.trim();
  if (rawUsers) {
    try {
      const parsed: unknown = JSON.parse(rawUsers);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          if (
            entry &&
            typeof entry === "object" &&
            typeof (entry as AdminAccount).username === "string" &&
            typeof (entry as AdminAccount).password === "string"
          ) {
            const username = (entry as AdminAccount).username.trim();
            const password = (entry as AdminAccount).password;
            if (username && password && !seen.has(username)) {
              accounts.push({ username, password });
              seen.add(username);
            }
          }
        }
      }
    } catch {
      // Invalid JSON — fall through to legacy vars
    }
  }

  const legacyUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
  const legacyPassword = process.env.ADMIN_PASSWORD ?? "";
  if (legacyPassword && !seen.has(legacyUsername)) {
    accounts.push({ username: legacyUsername, password: legacyPassword });
  }

  return accounts;
}

export function findAdminAccount(
  username: string,
  password: string,
): AdminAccount | null {
  const normalized = username.trim();
  for (const account of getAdminAccounts()) {
    if (
      safeEqual(normalized, account.username) &&
      safeEqual(password, account.password)
    ) {
      return account;
    }
  }
  return null;
}

/** @deprecated Use getAdminAccounts — kept for dev bypass label */
export function getAdminCredentials(): AdminAccount {
  const accounts = getAdminAccounts();
  return (
    accounts[0] ?? {
      username: process.env.ADMIN_USERNAME ?? "admin",
      password: process.env.ADMIN_PASSWORD ?? "",
    }
  );
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
  if (getAdminAccounts().length === 0) {
    throw new Error(
      "Configure at least one admin: set ADMIN_PASSWORD (and optional ADMIN_USERNAME), or ADMIN_USERS as a JSON array.",
    );
  }
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
