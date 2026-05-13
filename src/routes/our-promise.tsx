import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags, faqJsonLd } from "@/lib/seo";

const FAQ = [
  { q: "Is shipping really free?", a: "Free shipping on orders over $100 (and equivalents in regional currencies)." },
  { q: "How long is the warranty?", a: "Every Survival72 module is covered by a 2-year unconditional guarantee." },
  { q: "Can I return my order?", a: "Yes — 30-day returns, no questions asked. Items must be in resellable condition." },
  { q: "Is the gift box included?", a: "The premium magnetic gift box is an optional add-on at checkout for $29." },
];

export const Route = createFileRoute("/our-promise")({
  head: () => {
    const c = canonicalTags("/our-promise");
    return {
      meta: [
        { title: "Our Promise — Survival72™" },
        { name: "description", content: "Free shipping, 2-year guarantee, 30-day returns, gift-ready." },
        { property: "og:title", content: "Our Promise" },
        { property: "og:description", content: "Four guarantees that come with every Survival72 module." },
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
      slug="our-promise"
      defaults={{
        title: "Our Promise",
        intro: "Four guarantees that come with every Survival72 module.",
        body_md:
          "- Free shipping on orders over $100.\n- 2-year guarantee on every module.\n- 30-day returns, no questions asked.\n- Gift-ready magnetic box available at checkout.",
      }}
    />
  ),
});
