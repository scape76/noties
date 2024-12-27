"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MenuBar } from "@/components/editor/menu-bar";

const formSchema = z.object({
  name: z.string().min(1, "Title is required"),
  body: z.any(),
});

interface EditNoteFormProps {
  note: {
    id: number;
    name: string;
    body: any;
    topicId: number;
  };
}

export function EditNoteForm({ note }: EditNoteFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: note.name,
      body: note.body,
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: note.body,
    onUpdate: ({ editor }) => {
      form.setValue("body", editor.getJSON());
    },
  });

  const updateNote = api.notes.update.useMutation({
    onSuccess: () => {
      toast.success("Note updated successfully");
      router.push(`/notes/${note.id}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!editor) return;

    updateNote.mutate({
      id: note.id,
      name: data.name,
      body: editor.getJSON(),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Content</FormLabel>
          <div className="rounded-lg border">
            <MenuBar editor={editor} />
            <div className="min-h-[200px] p-4">
              <EditorContent editor={editor} className="prose max-w-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateNote.isLoading}>
            {updateNote.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
