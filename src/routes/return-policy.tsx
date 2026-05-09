import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy — Survival72™" },
      { name: "description", content: "30-day returns, no questions asked." },
    ],
  }),
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
