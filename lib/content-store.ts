import { readFile, writeFile } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";
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

async function readFromBlob(): Promise<SiteContent | null> {
  if (!blobStorageConfigured()) {
    return null;
  }

  try {
    const result = await get(BLOB_PATHNAME, {
      access: "private",
      useCache: false,
    });

    if (!result?.stream) {
      return null;
    }

    const text = await new Response(result.stream).text();
    return JSON.parse(text) as SiteContent;
  } catch {
    return null;
  }
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
