"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
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
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Title is required"),
  body: z.any(),
});

interface CreateNoteFormProps {
  topicId: number;
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 rounded-t-lg border bg-muted/50 p-2">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(editor.isActive("bold") && "bg-muted")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(editor.isActive("italic") && "bg-muted")}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(editor.isActive("underline") && "bg-muted")}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <div className="mx-2 my-auto h-6 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="mx-2 my-auto h-6 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(editor.isActive("bulletList") && "bg-muted")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(editor.isActive("orderedList") && "bg-muted")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CreateNoteForm({ topicId }: CreateNoteFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      body: "",
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    onUpdate: ({ editor }) => {
      form.setValue("body", editor.getJSON());
    },
  });

  const createNote = api.notes.create.useMutation({
    onSuccess: () => {
      toast.success("Note created successfully");
      router.push(`/topics/${topicId}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!editor) return;

    createNote.mutate({
      name: data.name,
      body: editor.getJSON(),
      topicId,
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
          <Button type="submit" disabled={createNote.isPending}>
            {createNote.isPending ? "Creating..." : "Create Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
