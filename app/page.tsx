import { HomePage } from "@/components/HomePage";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  return <HomePage content={content} />;
}
