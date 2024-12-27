import { redirect, notFound } from "next/navigation";
import { EditNoteForm } from "../_components/edit-note-form";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

interface EditNotePageProps {
  params: Promise<{
    noteId: string;
  }>;
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const session = await auth();
  if (!session) redirect("/login");
  const p = await params;

  const noteId = parseInt(p.noteId);
  if (isNaN(noteId)) notFound();

  try {
    const note = await api.notes.getById({ id: noteId });
    if (!note) notFound();

    return (
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Edit Note</h1>
        <EditNoteForm note={note} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching note:", error);
    notFound();
  }
}
