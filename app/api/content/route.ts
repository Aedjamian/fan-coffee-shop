import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  blobStorageConfigured,
  getSiteContent,
  isSiteContent,
  saveSiteContent,
} from "@/lib/content-store";
import { requireAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isSiteContent(body)) {
    return NextResponse.json({ error: "Invalid site content" }, { status: 400 });
  }

  try {
    await saveSiteContent(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save content.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/admin/dashboard");

  return NextResponse.json({
    ok: true,
    storage: blobStorageConfigured() ? "blob" : "file",
  });
}
