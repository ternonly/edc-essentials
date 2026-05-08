import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "Wholesale & Custom — Survival72™" },
      { name: "description", content: "B2B inquiries, corporate gifts, bulk and custom branding." },
    ],
  }),
  component: () => (
    <StaticPage
      title="Wholesale & Custom"
      intro="Bulk orders, corporate gifts, and custom branding for the Survival72 modular system."
    >
      <p>
        We work with offices, fleets, oilfield service teams, and gifting concierges across the
        GCC. Email <b>wholesale@survival72gear.com</b> with quantities, lead time, and any
        co-branding requirements.
      </p>
    </StaticPage>
  ),
});
