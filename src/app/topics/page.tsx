import { redirect } from "next/navigation";
import { TopicsClient } from "./topics-client";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";

export default async function TopicsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rootTopics = await api.topics.getRootTopics();

  return (
    <div className="container mx-auto p-6">
      <TopicsClient initialTopics={rootTopics} />
    </div>
  );
}
