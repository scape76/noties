// app/topics/[topicId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { TopicsClient } from "../topics-client";
import { NotesGrid } from "../_components/notes-grid";

interface TopicPageProps {
  params: {
    topicId: string;
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const topicId = parseInt(params.topicId);
  if (isNaN(topicId)) notFound();

  try {
    // Fetch the current topic and its ancestry chain
    const topic = await api.topics.getById({ id: topicId });
    if (!topic) notFound();

    // Fetch the topic's breadcrumb trail
    const breadcrumbTrail = await api.topics.getBreadcrumbTrail({
      id: topicId,
    });

    // Fetch notes for this topic
    const notes = await api.notes.getByTopicId({ topicId });

    return (
      <div className="container mx-auto p-6">
        <TopicsClient
          initialTopics={[topic]}
          initialBreadcrumbs={breadcrumbTrail}
          currentTopicId={topicId}
        />

        <div className="mt-8">
          <NotesGrid notes={notes} topicId={topicId} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching topic:", error);
    notFound();
  }
}
