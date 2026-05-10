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
          intro:
            "Active military, law enforcement, firefighters, and EMS get 10% off every order. Verified through GOVX ID.",
          body_md: `
## How GOVX verification works
1. Click **Verify with GOVX ID** below
2. Enter your service category and ID
3. Once verified, use code **GOVX10** at checkout for 10% off

GOVX is an independent verification service trusted by hundreds of US-based brands. Survival72™ never sees your personal documents.

Questions: survival72bob@gmail.com
          `.trim(),
        }}
      />
      <div style={{ textAlign: "center", padding: "0 24px 80px" }}>
        <Link to="/govx-verify" className="s72-btn s72-btn-primary">
          Verify with GOVX ID →
        </Link>
      </div>
    </div>
  ),
});
