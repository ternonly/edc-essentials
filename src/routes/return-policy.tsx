import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy — Survival72™" },
      { name: "description", content: "30-day returns, no questions asked." },
    ],
  }),
  component: () => (
    <StaticPage
      title="Return Policy"
      intro="If a Survival72 module is not right for you, return it within 30 days for a full refund."
    >
      <p>
        Items must be in resellable condition. Custom-engraved corporate orders are excluded.
        Reach out to <b>support@survival72gear.com</b> to start a return.
      </p>
    </StaticPage>
  ),
});
