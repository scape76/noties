import { redirect, notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { NoteContent } from "./_components/note-content";

interface NotePageProps {
  params: {
    noteId: string;
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const noteId = parseInt(params.noteId);
  if (isNaN(noteId)) notFound();

  try {
    const note = await api.notes.getById({ id: noteId });
    let html = null;
    if (note.body) html = generateHTML(note.body, [StarterKit, Underline]);

    if (!note) notFound();

    return (
      <div className="container mx-auto max-w-4xl p-6">
        <NoteContent note={note} html={html} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching note:", error);
    notFound();
  }
}
