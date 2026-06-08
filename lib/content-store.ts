import { readFile, writeFile } from "fs/promises";
import path from "path";
import { head, list, put } from "@vercel/blob";
import { unstable_noStore as noStore } from "next/cache";
import type { SiteContent } from "./content-types";
import { withDefaultExtrasCategory } from "./menu-defaults";

const LOCAL_PATH = path.join(process.cwd(), "data", "site-content.json");
const BLOB_PATHNAME = "fan-coffee/site-content.json";

/** Vercel Blob: read-write token and/or store ID (OIDC on Vercel). */
export function blobStorageConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

function blobFetchOptions() {
  return { cache: "no-store" as const, next: { revalidate: 0 } };
}

async function fetchBlobJson(url: string): Promise<SiteContent | null> {
  const response = await fetch(
    `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`,
    blobFetchOptions(),
  );
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as SiteContent;
}

async function readFromBlob(): Promise<SiteContent | null> {
  if (!blobStorageConfigured()) {
    return null;
  }

  try {
    const meta = await head(BLOB_PATHNAME);
    const url = meta.downloadUrl ?? meta.url;
    return await fetchBlobJson(url);
  } catch {
    // head() misses — try listing (store connected via BLOB_STORE_ID)
  }

  try {
    const { blobs } = await list({ prefix: "fan-coffee/" });
    const match =
      blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0];
    if (match?.url) {
      return await fetchBlobJson(match.downloadUrl ?? match.url);
    }
  } catch {
    return null;
  }

  return null;
}

async function writeToBlob(content: SiteContent): Promise<void> {
  if (!blobStorageConfigured()) {
    return;
  }

  const result = await put(BLOB_PATHNAME, JSON.stringify(content, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });

  if (!result?.url) {
    throw new Error("Blob upload did not return a URL.");
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  noStore();

  const fromBlob = await readFromBlob();
  if (fromBlob) {
    return normalizeSiteContent(fromBlob);
  }

  const raw = await readFile(LOCAL_PATH, "utf-8");
  return normalizeSiteContent(JSON.parse(raw) as SiteContent);
}

function normalizeSiteContent(content: SiteContent): SiteContent {
  return {
    ...content,
    customSections: content.customSections ?? [],
    menuCategories: withDefaultExtrasCategory(content.menuCategories ?? []),
  };
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (blobStorageConfigured()) {
    await writeToBlob(content);
    return;
  }

  const json = JSON.stringify(content, null, 2);
  await writeFile(LOCAL_PATH, json, "utf-8");
}

export function isSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const v = value as SiteContent;
  return (
    typeof v.hero?.titleBefore === "string" &&
    Array.isArray(v.menuCategories) &&
    typeof v.about?.body === "string"
  );
}
