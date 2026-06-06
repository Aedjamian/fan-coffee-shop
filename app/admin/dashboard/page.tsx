import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/admin/DashboardClient";
import { getSiteContent } from "@/lib/content-store";
import { requireAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();
  return <DashboardClient initialContent={content} username={session.username} />;
}
