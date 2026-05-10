import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Survival72™" },
      { name: "description", content: "Get in touch with Survival72 support and sales." },
    ],
  }),
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
