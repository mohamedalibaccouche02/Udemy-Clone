"use client";

import { useImperativeHandle, useState, useEffect, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import { cn } from "src/lib/utils";
import { Button } from "src/components/ui/button";

export interface EditorHandle {
  getContent: () => string;
}

interface EditorProps {
  value: string;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(({ value }, ref) => {
  const [content, setContent] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Enter chapter description...",
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose max-w-none border rounded-md p-4 focus:outline-none bg-white min-h-[150px]"
        ),
      },
    },
  });

  useImperativeHandle(ref, () => ({
    getContent: () => content,
  }));

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-muted">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted-foreground/10" : ""}
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted-foreground/10" : ""}
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={
            editor.isActive("underline") ? "bg-muted-foreground/10" : ""
          }
        >
          <UnderlineIcon size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike") ? "bg-muted-foreground/10" : ""
          }
        >
          <Strikethrough size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList") ? "bg-muted-foreground/10" : ""
          }
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList") ? "bg-muted-foreground/10" : ""
          }
        >
          <ListOrdered size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={
            editor.isActive({ textAlign: "left" }) ? "bg-muted-foreground/10" : ""
          }
        >
          <AlignLeft size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "bg-muted-foreground/10" : ""
          }
        >
          <AlignCenter size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" }) ? "bg-muted-foreground/10" : ""
          }
        >
          <AlignRight size={16} />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});

Editor.displayName = "Editor";
