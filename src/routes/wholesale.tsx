import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "Corporate & Government Procurement — Survival72™" },
      { name: "description", content: "B2B inquiries, corporate gifts, bulk and custom branding." },
    ],
  }),
  component: () => (
    <DynamicPage
      slug="wholesale"
      defaults={{
        title: "Corporate & Government Procurement",
        intro: "Bulk orders, corporate gifts, and custom branding for the Survival72 modular system.",
        body_md:
          "We work with offices, fleets, oilfield service teams, and gifting concierges across the GCC. Email **procurement@survival72gear.com** with quantities, lead time, and any co-branding requirements.",
      }}
    />
  ),
});
