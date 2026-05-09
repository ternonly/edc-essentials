import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContentBlock } from "@/lib/site-content";

type Props = {
  slug: string;
  defaults: { kicker?: string; title: string; intro?: string; body_md?: string };
};

export function DynamicPage({ slug, defaults }: Props) {
  const c = useContentBlock("page", slug, {
    kicker: defaults.kicker ?? "Survival72",
    title: defaults.title,
    intro: defaults.intro ?? "",
    body_md: defaults.body_md ?? "",
  });
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px" }}>
      <span className="s72-kicker" style={{ color: "#C9A96E", display: "block", marginBottom: 12 }}>
        {c.kicker}
      </span>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 18px", letterSpacing: "-0.5px" }}>
        {c.title}
      </h1>
      {c.intro && (
        <p style={{ color: "#666", fontSize: 17, lineHeight: 1.7, marginBottom: 28 }}>{c.intro}</p>
      )}
      {c.body_md && (
        <div className="s72-prose" style={{ color: "#333", fontSize: 15, lineHeight: 1.8 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body_md}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
