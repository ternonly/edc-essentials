import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags, faqJsonLd } from "@/lib/seo";

const FAQ = [
  { q: "What is the return window?", a: "30 days from delivery, no questions asked." },
  { q: "What condition do items need to be in?", a: "Items must be in resellable condition." },
  { q: "Are any items excluded?", a: "Custom-engraved corporate orders are excluded from returns." },
];

export const Route = createFileRoute("/return-policy")({
  head: () => {
    const c = canonicalTags("/return-policy");
    return {
      meta: [
        { title: "Return Policy — Survival72™" },
        { name: "description", content: "30-day returns, no questions asked. Full refund on resellable items." },
        { property: "og:title", content: "Return Policy" },
        { property: "og:description", content: "30-day returns on every Survival72 module." },
        ...c.meta,
      ],
      links: c.links,
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(FAQ)) },
      ],
    };
  },
  component: () => (
    <DynamicPage
      slug="return-policy"
      defaults={{
        title: "Return Policy",
        intro: "If a Survival72 module is not right for you, return it within 30 days for a full refund.",
        body_md:
          "Items must be in resellable condition. Custom-engraved corporate orders are excluded. Reach out to **support@survival72gear.com** to start a return.",
      }}
    />
  ),
});
