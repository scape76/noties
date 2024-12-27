"use client";

// app/notes/[noteId]/_components/note-content.tsx
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Edit, FolderOpen } from "lucide-react";
import { Note, Topic } from "@/server/db/schema";
import Link from "next/link";

interface NoteContentProps {
  note: Note & {
    topic: Pick<Topic, "name" | "id"> | null;
  };
  html: string | null;
}

export function NoteContent({ note, html }: NoteContentProps) {
  const router = useRouter();

  const formattedDate = new Date(note.editedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{note.name}</h1>
          <p className="mt-1 text-muted-foreground">
            Last edited on {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/topics/${note.topicId}`}>
              <FolderOpen className="mr-2 h-4 w-4" />
              View Topic
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/topics/${note.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Note
            </Link>
          </Button>
        </div>
      </div>

      {/* Topic breadcrumb */}
      {note.topic && (
        <div className="text-sm text-muted-foreground">
          Topic: {note.topic.name}
        </div>
      )}

      {/* Note content with typography */}
      <div className="prose dark:prose-invert max-w-none">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="italic text-muted-foreground">No content available</p>
        )}
      </div>
    </div>
  );
}
