import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/corporate-partnerships")({
  head: () => ({
    meta: [
      { title: "Corporate & Bespoke — Survival72™" },
      { name: "description", content: "Corporate partnerships, custom branding, executive gifting." },
    ],
  }),
  component: () => (
    <StaticPage
      title="Corporate & Bespoke"
      intro="Executive gifting and co-branded modular kits for partners across the region."
    >
      <p>
        Engraved handles, custom magnetic boxes, and bespoke Field Guide editions are available
        for orders of 25 units or more. Contact <b>partners@survival72gear.com</b>.
      </p>
    </StaticPage>
  ),
});
