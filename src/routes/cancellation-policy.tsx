import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/cancellation-policy")({
  head: () => ({
    meta: [
      { title: "Order Cancellation — Survival72™" },
      { name: "description", content: "How and when you can cancel a Survival72 order." },
    ],
  }),
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="cancellation-policy"
        defaults={{
          kicker: "Cancellations",
          title: "Order Cancellation",
          intro: "Orders are processed immediately after confirmation. Once an order enters fulfilment (~2 hours), it cannot be cancelled.",
          body_md: `
## After shipment
If the order has already left our warehouse, please follow the [standard return process](/return-policy).

Contact: survival72bob@gmail.com — we reply within 12h.
          `.trim(),
        }}
      />
    </div>
  ),
});
