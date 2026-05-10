import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { useEffect } from "react";

const btn: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 13,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  borderRadius: 4,
};

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener", target: "_blank" } }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: "min-height:340px;padding:16px;border:1px solid #ddd;border-top:none;border-radius:0 0 6px 6px;outline:none;font-size:16px;line-height:1.7;",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) editor.commands.setContent(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return <div style={{ minHeight: 340, border: "1px solid #ddd", borderRadius: 6 }} />;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 8, border: "1px solid #ddd", borderRadius: "6px 6px 0 0", background: "#fafafa" }}>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</button>
        <button type="button" style={btn} onClick={() => {
          const url = prompt("Link URL"); if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>Link</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
        <button type="button" style={btn} onClick={() => {
          const url = prompt("Image URL"); if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>🖼 Image</button>
        <button type="button" style={btn} onClick={() => {
          const url = prompt("YouTube URL"); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }}>▶ YouTube</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().undo().run()}>↶</button>
        <button type="button" style={btn} onClick={() => editor.chain().focus().redo().run()}>↷</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
