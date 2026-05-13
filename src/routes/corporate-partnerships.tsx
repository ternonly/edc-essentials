import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/corporate-partnerships")({
  head: () => {
    const c = canonicalTags("/corporate-partnerships");
    return {
      meta: [
        { title: "Corporate & Bespoke — Survival72™" },
        { name: "description", content: "Corporate partnerships, custom branding and executive gifting from 25 units." },
        { property: "og:title", content: "Corporate & Bespoke" },
        { property: "og:description", content: "Engraved handles, custom magnetic boxes and bespoke Field Guide editions." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: () => (
    <DynamicPage
      slug="corporate-partnerships"
      defaults={{
        title: "Corporate & Bespoke",
        intro: "Executive gifting and co-branded modular kits for partners across the region.",
        body_md:
          "Engraved handles, custom magnetic boxes, and bespoke Field Guide editions are available for orders of 25 units or more. Contact **partners@survival72gear.com**.",
      }}
    />
  ),
});
