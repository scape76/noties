import { Button } from "@/components/ui/button";
import {
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Bold,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";

export function MenuBar({ editor }: { editor: Editor | null }) {
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
