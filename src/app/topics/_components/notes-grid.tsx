"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Note, Topic } from "@/server/db/schema";

interface NotesGridProps {
  notes: Note[];
  topicId: Topic["id"];
}

export function NotesGrid({ notes, topicId }: NotesGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => router.push(`/topics/${topicId}/new-note`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block transition-opacity hover:opacity-80"
          >
            <Card className={viewMode === "list" ? "flex items-center" : ""}>
              <CardHeader>
                <CardTitle>{note.name}</CardTitle>
                <CardDescription>
                  {typeof note.body === "string"
                    ? note.body.slice(0, 100) +
                      (note.body.length > 100 ? "..." : "")
                    : ""}
                </CardDescription>
              </CardHeader>
              {viewMode === "grid" && (
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  {note.editedAt !== note.createdAt && (
                    <div className="flex items-center justify-between">
                      <span>Last edited:</span>
                      <span>
                        {new Date(note.editedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </Link>
        ))}

        {notes.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No notes yet. Create your first note!
          </div>
        )}
      </div>
    </div>
  );
}
