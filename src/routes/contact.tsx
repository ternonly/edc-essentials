import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => {
    const c = canonicalTags("/contact");
    return {
      meta: [
        { title: "Contact — Survival72™" },
        { name: "description", content: "Get in touch with Survival72 support and sales — we reply within one business day." },
        { property: "og:title", content: "Contact Survival72" },
        { property: "og:description", content: "Support, sales and procurement contact details." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: () => (
    <DynamicPage
      slug="contact"
      defaults={{
        title: "Contact",
        intro: "We answer every message within one business day.",
        body_md:
          "General: **hello@survival72gear.com**\n\nSupport: **support@survival72gear.com**\n\nProcurement: **procurement@survival72gear.com**",
      }}
    />
  ),
});
