import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => {
    const c = canonicalTags("/about");
    return {
      meta: [
        { title: "About — Survival72™" },
        { name: "description", content: "Why Survival72 builds modular EDC tools for the 72 hours that matter." },
        { property: "og:title", content: "About Survival72" },
        { property: "og:description", content: "Why Survival72 builds modular EDC tools for the 72 hours that matter." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: () => (
    <DynamicPage
      slug="about"
      defaults={{
        title: "About Survival72",
        intro: "Survival72™ exists for the 72 hours that matter most — the gap between the moment something goes wrong and the moment you reach safety.",
        body_md:
          "We build modular tools for everyday carry, designed to be genuinely useful in the GCC and the wider Middle East. Industrial luxury aesthetic, professional-grade materials, and a no-nonsense product roadmap.\n\nThree modules. One system. Built to work alone — engineered to work together.",
      }}
    />
  ),
});
