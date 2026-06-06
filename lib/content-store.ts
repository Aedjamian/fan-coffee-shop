import { readFile, writeFile } from "fs/promises";
import path from "path";
import { head, put } from "@vercel/blob";
import type { SiteContent } from "./content-types";
import { withDefaultExtrasCategory } from "./menu-defaults";

const LOCAL_PATH = path.join(process.cwd(), "data", "site-content.json");
const BLOB_PATHNAME = "fan-coffee/site-content.json";

async function readFromBlob(): Promise<SiteContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  try {
    const meta = await head(BLOB_PATHNAME);
    const response = await fetch(meta.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SiteContent;
  } catch {
    return null;
  }
}

async function writeToBlob(content: SiteContent): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  await put(BLOB_PATHNAME, JSON.stringify(content, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getSiteContent(): Promise<SiteContent> {
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
  const json = JSON.stringify(content, null, 2);
  await writeFile(LOCAL_PATH, json, "utf-8");
  await writeToBlob(content);
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
