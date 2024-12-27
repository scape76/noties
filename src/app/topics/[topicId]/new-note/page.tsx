import { redirect } from "next/navigation";
import { CreateNoteForm } from "./_components/create-note-form";
import { auth } from "@/server/auth";

interface NewNotePageProps {
  params: {
    topicId: string;
  };
}

export default async function NewNotePage({ params }: NewNotePageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const topicId = parseInt(params.topicId);
  if (isNaN(topicId)) redirect("/topics");

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Create New Note</h1>
      <CreateNoteForm topicId={topicId} />
    </div>
  );
}
