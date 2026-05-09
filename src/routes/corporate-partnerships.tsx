import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/corporate-partnerships")({
  head: () => ({
    meta: [
      { title: "Corporate & Bespoke — Survival72™" },
      { name: "description", content: "Corporate partnerships, custom branding, executive gifting." },
    ],
  }),
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
