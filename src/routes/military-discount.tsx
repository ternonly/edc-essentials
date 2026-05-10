import { createFileRoute, Link } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/military-discount")({
  head: () => ({
    meta: [
      { title: "Military & First Responder Discount — Survival72™" },
      { name: "description", content: "10% off for active military, law enforcement, firefighters, and EMS." },
    ],
  }),
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="military-discount"
        defaults={{
          kicker: "Service discount",
          title: "Military & First Responder — 10% Off",
          intro: "Active military, law enforcement, firefighters, and EMS get 10% off every order. Verified through GOVX ID.",
          body_md: `
## How GOVX verification works
1. Click the **GOVX verification** link at checkout
2. Sign in or create a GOVX ID account
3. Verify your military / first responder status
4. The discount is auto-applied to your cart

GOVX is an independent verification service trusted by hundreds of US-based brands. Survival72™ never sees your personal documents.

Questions: survival72bob@gmail.com
          `.trim(),
        }}
      />
    </div>
  ),
});
